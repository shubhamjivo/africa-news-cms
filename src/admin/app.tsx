import type { StrapiApp } from '@strapi/strapi/admin';
import AuthLogo from './extensions/logo-auth.png';
import MenuLogo from './extensions/logo-menu.png';
import Favicon from './extensions/favicon.png';

// Brand colours of the website (africa-energy-news/app/globals.css).
const NAVY_900 = '#030e50';
const NAVY_400 = '#05146c';
const GREEN_200 = '#add139';
const GREEN_100 = '#c8e07b';

const FONT = "'Roboto', Arial, Helvetica, sans-serif";

export default {
  config: {
    auth: { logo: AuthLogo },
    menu: { logo: MenuLogo },
    head: { favicon: Favicon },
    theme: {
      light: {
        colors: {
          // Navy for actions, links and the active menu item.
          primary100: '#e8eaf5',
          primary200: '#c4c9e6',
          primary500: NAVY_400,
          primary600: NAVY_400,
          primary700: NAVY_900,
          buttonPrimary500: NAVY_400,
          buttonPrimary600: NAVY_900,
          // Ink and hairlines as on the site.
          neutral800: NAVY_900,
          neutral900: NAVY_900,
          neutral150: '#e6e8f2',
          neutral200: '#d6d9ea',
          // Green accent for published / success states.
          success100: '#f1f7dc',
          success200: GREEN_100,
          success500: '#8fb01f',
          success600: '#7a9819',
          success700: '#5f7712',
        },
      },
      dark: {
        colors: {
          // On navy, the green accent carries links and the active menu item.
          neutral0: '#0a1242',
          neutral100: '#050a2e',
          neutral150: '#141d5c',
          neutral200: '#1c2670',
          primary100: '#141d5c',
          primary200: '#1c2670',
          primary500: GREEN_200,
          primary600: GREEN_200,
          primary700: GREEN_100,
          // Buttons keep white text, so they use a brighter navy, not green.
          buttonPrimary500: '#2b3cb8',
          buttonPrimary600: '#3a4dd0',
          success500: GREEN_200,
          success600: GREEN_200,
          success700: GREEN_100,
        },
      },
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Africa Energy News',
        'Auth.form.welcome.subtitle': 'Log in to the newsroom CMS',
        'app.components.LeftMenu.navbrand.title': 'Africa Energy News',
        'app.components.LeftMenu.navbrand.workplace': 'Newsroom CMS',
      },
    },
    tutorials: false,
    notifications: { releases: false },
    locales: [],
  },
  bootstrap(_app: StrapiApp) {
    // Same typeface as the website.
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    // Everything except code blocks and the rich-text editor's own content.
    style.textContent = `body, body *:not(code):not(pre):not(.ck-content):not(.ck-content *) { font-family: ${FONT} !important; }`;
    document.head.appendChild(style);
  },
};
