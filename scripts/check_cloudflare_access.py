"""Check unauthenticated Access redirects. Does not perform login or deployment."""
import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check(base, path):
    opener = urllib.request.build_opener(NoRedirect())
    url = base + path
    request = urllib.request.Request(url, headers={
        "User-Agent": "PCIe-Study-Unauthenticated-Access-Check",
        "Cache-Control": "no-cache",
    })
    try:
        with opener.open(request, timeout=20) as response:
            code, location = response.status, response.headers.get("Location", "")
    except urllib.error.HTTPError as response:
        code, location = response.code, response.headers.get("Location", "")
        response.close()
    except (urllib.error.URLError, TimeoutError) as error:
        return {"host": urllib.parse.urlsplit(base).hostname, "path": path,
                "access_redirect": False, "error": str(error)}
    target = urllib.parse.urlsplit(urllib.parse.urljoin(url, location))
    # A generic 403 can be an unrelated edge rule, so is deliberately inconclusive.
    protected = (code in (301, 302, 303, 307, 308)
                 and target.scheme == "https"
                 and bool(target.hostname)
                 and target.hostname.endswith(".cloudflareaccess.com")
                 and target.path.startswith("/cdn-cgi/access/login/"))
    return {"host": urllib.parse.urlsplit(base).hostname, "path": path,
            "status": code, "access_redirect": protected,
            "redirect_host": target.hostname if location else None,
            "redirect_path": target.path if location else None}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("urls", nargs="+", help="Actual production and deployment HTTPS URLs")
    args = parser.parse_args()
    bases = []
    for value in args.urls:
        try:
            url = urllib.parse.urlsplit(value)
            port = url.port
        except ValueError:
            parser.error("Invalid HTTPS host or port")
        if (url.scheme != "https" or not url.hostname or url.username or url.password
                or port not in (None, 443) or url.query or url.fragment
                or url.path not in ("", "/")):
            parser.error("Use a bare HTTPS host with no credentials, path, query or fragment")
        bases.append(urllib.parse.urlunsplit((url.scheme, url.netloc, "", "", "")))
    rows = [check(base, path) for base in dict.fromkeys(bases)
            for path in ("/", "/data.js", "/app.js", "/style.css")]
    for row in rows:
        print(json.dumps(row, ensure_ascii=False))
    if not all(row["access_redirect"] for row in rows):
        print("Not verified: one or more URLs did not explicitly redirect to Access login.", file=sys.stderr)
        return 1
    print("Unauthenticated Access redirects verified; authorized login and policies still require review.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
