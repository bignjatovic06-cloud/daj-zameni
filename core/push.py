import json
import threading
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_one(sub, title, body, url):
    try:
        from pywebpush import webpush, WebPushException
        webpush(
            subscription_info=json.loads(sub.subscription_json),
            data=json.dumps({'title': title, 'body': body, 'url': url}),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={'sub': f'mailto:{settings.VAPID_EMAIL}'},
        )
    except Exception as e:
        logger.error('Push failed for subscription %s: %s', sub.pk, e)
        # Remove invalid/expired subscriptions (410 Gone)
        err_str = str(e)
        if '410' in err_str or '404' in err_str:
            sub.delete()


def send_push_to_user(user, title, body, url='/'):
    if not getattr(settings, 'VAPID_PRIVATE_KEY', ''):
        return

    def _send():
        for sub in user.push_subscriptions.all():
            _send_one(sub, title, body, url)

    threading.Thread(target=_send, daemon=True).start()
