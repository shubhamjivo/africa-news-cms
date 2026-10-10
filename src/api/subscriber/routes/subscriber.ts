/**
 * subscriber router
 *
 * Only the website's sign-up call is exposed; there are no public routes to
 * list or change subscribers. The controller checks the website's secret.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/subscribers/subscribe',
      handler: 'subscriber.subscribe',
      config: { auth: false },
    },
  ],
};
