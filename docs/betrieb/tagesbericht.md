# Daily report: the ten most-viewed entities

`php/cron/report.php` sends one mail per day to `llb@sirhexalot.de`: the ten
entities with the most page views in the current month, as a table with the
count, the type, the German name and the three language addresses.

The data comes from `llb_aufrufe`, the monthly view counter (see
[`AGENTS.md`](../../AGENTS.md#publication-privacy-and-rights), "Page views per
entity"). One row per month, kind and entity id; `/de`, `/en` and `/fr` of one
entity land in the same row, so the count is language-independent. The table
stores no address, no cookie and no visit history.

## Setting up the cron job in konsoleH

Hetzner's web hosting console (**konsoleH**) has a cron manager under
*Settings → Cronjob Manager*. Three fields:

| Field | Value |
|---|---|
| Interpreter | `/usr/bin/php` (the account's configured PHP version) |
| Script | `/usr/www/users/<konto>/public_html/mm/php/cron/report.php` |
| Schedule | `0 6 * * *` (daily at 06:00 server time) |

The absolute script path is the document root plus `/php/cron/report.php`. The
document root is the FTP target from `~/.config/mql-upload.conf` (`path`), here
`/public_html/mm`; konsoleH shows the account's home directory next to the
field. The `.htaccess` blocks `/php` from the web, so the script is reachable
only from the shell.

The cron job needs the release on the server: `php/cron/report.php` is part of
the `programm` component and is copied with every release. Nothing else is
needed – no database schema change, no new table.

## What the mail contains

- Subject: `LOTRO Log Book · Top 10 im November 2026`
- HTML table: count, type (German name such as *Aufgabe* or *Gegenstand*),
  German entity name, links DE/EN/FR
- Plain-text alternative for mail clients without HTML
- A closing note that the count is language-independent and excludes bots

At the start of a month the table is empty; the mail then says so in one line
instead of showing an empty table. Names come from the prepared page models in
`phpdata`; a row whose entity no longer exists still appears, showing its id
instead of a name.

The script only runs from the shell (`PHP_SAPI` check) – a web request ends in
404, so nobody can trigger a mail through the browser.

## Flags for a manual run

```bash
# Show the mail instead of sending it
php php/cron/report.php --trocken

# Only the HTML part, e.g. to check the table in a browser
php php/cron/report.php --trocken --html > /tmp/bericht.html

# Another month or a longer list
php php/cron/report.php --monat=2026-11 --anzahl=20

# Send to another address
LLB_REPORT_TO=you@example.com php php/cron/report.php
```

The recipient defaults to `llb@sirhexalot.de` (`LLB_REPORT_TO` overrides it).
The SMTP account is the one from the feedback form (`phptmp/llb-feedback.env`):
`LLB_FEEDBACK_SMTP_HOST`, `_PORT`, `_USER`, `_PASSWORD`, and `LLB_FEEDBACK_FROM`
as sender. Without that file the script exits with code 1 and a message.

## Failure behaviour

- **Database unreachable:** the mail is not sent; the script writes
  `Datenbank nicht erreichbar` to `phptmp/llb-report.log` and exits with 1.
  konsoleH mails the cron output on request, so the failure stays visible.
- **SMTP refuses:** the error goes to the log and to stderr, exit code 1.
- **No views yet:** a short mail with the empty-table sentence, exit code 0.
- Every run appends one line to `phptmp/llb-report.log` (UTC timestamp, month,
  result). The log contains no visitor data.

The first run after the change belongs in a manual test: run
`php php/cron/report.php --trocken` on the server (or locally against the
preview's `phpdata`) and compare the table with the live start page. Then set
the cron job and check the first mail.
