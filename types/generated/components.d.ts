import type { Schema, Struct } from '@strapi/strapi';

export interface HomeSection extends Struct.ComponentSchema {
  collectionName: 'components_home_sections';
  info: {
    description: 'One section of the home page: its heading, link and position';
    displayName: 'Home section';
    icon: 'layout';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    kicker: Schema.Attribute.String;
    link_label: Schema.Attribute.String;
    link_url: Schema.Attribute.String;
    section: Schema.Attribute.Enumeration<
      [
        'Lead story',
        'What Matters Today',
        'Africa Times',
        'Energy Brief',
        'News',
        'Reels',
        'Project Watch',
        'Insights',
        'Investment Watch',
        'Watch & Listen',
        'Latest Reports',
        'Newsletter',
      ]
    > &
      Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SharedEnergyMix extends Struct.ComponentSchema {
  collectionName: 'components_shared_energy_mixs';
  info: {
    description: 'Number of projects for one technology';
    displayName: 'Energy mix item';
    icon: 'lightbulb';
  };
  attributes: {
    projects: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    technology: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    description: 'A heading with a list of links';
    displayName: 'Footer column';
    icon: 'layout';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'A text link';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_socials';
  info: {
    description: '';
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    socialNetwork: Schema.Attribute.Enumeration<['Facebook', 'Twitter']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Search and social sharing. Leave empty to use the title, summary and main image.';
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    metaRobots: Schema.Attribute.String;
    metaSocial: Schema.Attribute.Component<'shared.meta-social', true>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    description: 'A headline figure with a short label, e.g. 6.2 GW / Operating';
    displayName: 'Stat';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'home.section': HomeSection;
      'shared.energy-mix': SharedEnergyMix;
      'shared.footer-column': SharedFooterColumn;
      'shared.link': SharedLink;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
      'shared.stat': SharedStat;
    }
  }
}
