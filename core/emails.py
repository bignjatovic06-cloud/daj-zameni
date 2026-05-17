from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import threading
import logging

logger = logging.getLogger(__name__)

SITE_NAME = 'Daj Zameni'
SITE_URL  = settings.SITE_URL


def _send_async(subject, text_body, html_body, to_email):
    if not to_email:
        logger.warning('Email skipped: no to_email')
        return

    def _send():
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.send(fail_silently=False)
            logger.info('Email sent to %s: %s', to_email, subject)
        except Exception as e:
            logger.error('Email failed to %s: %s — %s', to_email, subject, e)

    threading.Thread(target=_send, daemon=True).start()


def _wrap(content, title):
    return f"""<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ec;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ec;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- header -->
        <tr>
          <td style="background:#0d6e6f;border-radius:12px 12px 0 0;padding:24px 32px;">
            <a href="{SITE_URL}" style="text-decoration:none;color:#fff;font-size:18px;font-weight:700;letter-spacing:-.01em;">
              ⇄ Daj Zameni
            </a>
          </td>
        </tr>
        <!-- body -->
        <tr>
          <td style="background:#fff;padding:32px;border-left:1px solid #e5e3dc;border-right:1px solid #e5e3dc;">
            {content}
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="background:#f5f3ec;border:1px solid #e5e3dc;border-top:none;border-radius:0 0 12px 12px;
                     padding:20px 32px;text-align:center;font-size:12px;color:#9ca3af;">
            Daj Zameni · Razmena bez posrednika<br>
            <a href="{SITE_URL}" style="color:#0d6e6f;text-decoration:none;">{SITE_URL}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _btn(text, url):
    return f"""
    <table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
      <tr>
        <td style="background:#0d6e6f;border-radius:8px;">
          <a href="{url}" style="display:inline-block;padding:12px 24px;color:#fff;font-weight:600;
             font-size:14px;text-decoration:none;">{text}</a>
        </td>
      </tr>
    </table>"""


def _h(text):
    return f'<h2 style="margin:0 0 12px;font-size:20px;color:#111827;font-weight:700;">{text}</h2>'


def _p(text):
    return f'<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">{text}</p>'


def _listing_pill(title):
    return f'<span style="background:#f5f3ec;border:1px solid #e5e3dc;border-radius:6px;padding:3px 10px;font-size:13px;color:#374151;">„{title}"</span>'


# ── Email functions ──────────────────────────────────────────────

def send_new_offer(to_user, from_username, listing_title, offered_title, cash_offer, message):
    """Listing owner receives: someone wants to swap."""
    if not to_user.email:
        return

    extra = ''
    if offered_title:
        extra += f'<br>Nudi: {_listing_pill(offered_title)}'
    if cash_offer:
        extra += f'<br>Doplata: <strong>{int(cash_offer)} RSD</strong>'
    if message:
        extra += f'<br><em style="color:#6b7280;">„{message}"</em>'

    content = (
        _h(f'{from_username} želi da zameni tvoj oglas') +
        _p(f'Korisnik <strong>{from_username}</strong> je predložio razmenu za tvoj oglas {_listing_pill(listing_title)}.{extra}') +
        _btn('Pogledaj ponudu →', SITE_URL)
    )
    text = f'{from_username} je predložio razmenu za tvoj oglas „{listing_title}". Poseti {SITE_URL} da vidiš ponudu.'

    _send_async(
        subject=f'{from_username} želi da zameni tvoj oglas — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Nova ponuda za razmenu'),
        to_email=to_user.email,
    )


def send_offer_accepted(to_user, by_username, listing_title):
    """Offer sender receives: their offer was accepted."""
    if not to_user.email:
        return

    content = (
        _h('Tvoja ponuda je prihvaćena! 🎉') +
        _p(f'<strong>{by_username}</strong> je prihvatio/la tvoju ponudu za oglas {_listing_pill(listing_title)}.') +
        _p('Možete se dogovoriti o detaljima razmene putem poruka.') +
        _btn('Otvori razgovor →', SITE_URL)
    )
    text = f'{by_username} je prihvatio/la tvoju ponudu za „{listing_title}". Poseti {SITE_URL}.'

    _send_async(
        subject=f'Ponuda prihvaćena: „{listing_title}" — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Ponuda prihvaćena'),
        to_email=to_user.email,
    )


def send_offer_declined(to_user, by_username, listing_title):
    """Offer sender receives: their offer was declined."""
    if not to_user.email:
        return

    content = (
        _h('Ponuda nije prihvaćena') +
        _p(f'<strong>{by_username}</strong> nije prihvatio/la tvoju ponudu za oglas {_listing_pill(listing_title)}.') +
        _p('Ne brini — ima još mnogo oglasa! Pogledaj šta je dostupno.') +
        _btn('Pretraži oglase →', SITE_URL)
    )
    text = f'{by_username} nije prihvatio/la tvoju ponudu za „{listing_title}". Poseti {SITE_URL}.'

    _send_async(
        subject=f'Ponuda odbijena: „{listing_title}" — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Ponuda odbijena'),
        to_email=to_user.email,
    )


def send_swap_waiting_confirm(to_user, from_username, listing_title):
    """One party confirmed swap, waiting for the other."""
    if not to_user.email:
        return

    content = (
        _h('Čeka se tvoja potvrda') +
        _p(f'<strong>{from_username}</strong> je potvrdio/la da je razmena za {_listing_pill(listing_title)} završena.') +
        _p('Kada i ti potvrdiš, razmena će biti zvanično završena i možete ostaviti ocene.') +
        _btn('Potvrdi razmenu →', SITE_URL)
    )
    text = f'{from_username} je potvrdio razmenu za „{listing_title}". Poseti {SITE_URL} da i ti potvrdiš.'

    _send_async(
        subject=f'Potvrdi razmenu: „{listing_title}" — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Potvrdi razmenu'),
        to_email=to_user.email,
    )


def send_swap_completed(to_user, other_username, listing_title):
    """Both confirmed — swap is done, prompt for review."""
    if not to_user.email:
        return

    content = (
        _h('Razmena završena! ✓') +
        _p(f'Razmena sa <strong>{other_username}</strong> za oglas {_listing_pill(listing_title)} je uspešno završena.') +
        _p('Ostavi ocenu kako bi pomogao/la zajednici da zna sa kim može da razmenjuje.') +
        _btn('Ostavi ocenu →', SITE_URL)
    )
    text = f'Razmena sa {other_username} za „{listing_title}" je završena. Poseti {SITE_URL} da ostaviš ocenu.'

    _send_async(
        subject=f'Razmena završena — ostavi ocenu — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Razmena završena'),
        to_email=to_user.email,
    )


def send_new_message(to_user, from_username, listing_title):
    """Recipient receives: new chat message."""
    if not to_user.email:
        return

    subject_listing = f' o oglasu „{listing_title}"' if listing_title else ''
    content = (
        _h(f'Nova poruka od {from_username}') +
        _p(f'<strong>{from_username}</strong> ti je poslao/la poruku{subject_listing}.') +
        _btn('Pročitaj poruku →', SITE_URL)
    )
    text = f'{from_username} ti je poslao/la poruku{subject_listing}. Poseti {SITE_URL}.'

    _send_async(
        subject=f'Nova poruka od {from_username} — Daj Zameni',
        text_body=text,
        html_body=_wrap(content, 'Nova poruka'),
        to_email=to_user.email,
    )
