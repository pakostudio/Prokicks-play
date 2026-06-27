'use client';

import Script from 'next/script';

export function Observability() {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  const environment = process.env.NODE_ENV || 'production';

  return (
    <>
      {sentryDsn && (
        <>
          <Script src="https://browser.sentry-cdn.com/8.55.0/bundle.tracing.min.js" strategy="afterInteractive" crossOrigin="anonymous" />
          <Script id="prokicks-sentry-init" strategy="afterInteractive">
            {`
              window.Sentry && window.Sentry.init({
                dsn: ${JSON.stringify(sentryDsn)},
                tracesSampleRate: 0.1,
                environment: ${JSON.stringify(environment)}
              });
            `}
          </Script>
        </>
      )}
      {mixpanelToken && (
        <Script id="prokicks-mixpanel-init" strategy="afterInteractive">
          {`
            (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
            mixpanel.init(${JSON.stringify(mixpanelToken)}, { debug: false, persistence: "localStorage" });
          `}
        </Script>
      )}
    </>
  );
}
