# Security Policy

## Reporting a vulnerability

If you discover a security issue in `@LibermallIDbot` **do not open a public GitHub issue**. Use one of these private channels instead:

| Channel | Use it for |
|---|---|
| **GitHub Security Advisory** | Private coordinated disclosure via the *Security* tab |
| **Telegram** to [@LibermallIDbot](https://t.me/LibermallIDbot) → `/security` | Quick disclosure with screenshots |

We acknowledge reports within **48 hours**, triage within **5 business days**, and aim to ship a fix within **30 days** for high-severity issues.

## Scope

In scope:

- The bot deployed at [@LibermallIDbot](https://t.me/LibermallIDbot)
- This source code repository
- The Casdoor admin-API sync flow (`src/casdoor.js`)
- The Mini App handoff (`webApp` button → `id.libermall.com/app/`)

Out of scope:

- Vulnerabilities in upstream [Telegraf](https://github.com/telegraf/telegraf) — report directly to that project
- Vulnerabilities in upstream [Casdoor](https://github.com/casdoor/casdoor) — report directly to that project
- Phishing or social-engineering against operators
- DoS / volumetric attacks
- Theoretical CVEs without a working proof-of-concept

## Safe-harbor

We won't pursue legal action against researchers who:

1. Make good-faith effort to avoid privacy violations and service degradation.
2. Don't exfiltrate data beyond what's needed to prove the issue.
3. Give us reasonable time to remediate before public disclosure (typically 90 days).
4. Don't exploit the issue for personal gain.

## Hall of fame

Researchers who report valid vulnerabilities will be credited (with consent) in [`CHANGELOG.md`](CHANGELOG.md) and on [`id.libermall.com/security.html`](https://id.libermall.com/security.html).

## Supported versions

This repository ships from `main`. Security fixes are applied to `main` and tagged with a new patch release. We support the latest `1.x` release.
