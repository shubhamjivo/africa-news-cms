import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsArticleList extends Struct.ComponentSchema {
  collectionName: 'components_sections_article_lists';
  info: {
    description: 'Hand-picked articles for a section';
    displayName: 'Article picks';
    icon: 'file';
  };
  attributes: {
    articles: Schema.Attribute.Relation<'oneToMany', 'api::article.article'>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsDesk extends Struct.ComponentSchema {
  collectionName: 'components_sections_desks';
  info: {
    description: 'A titled column of hand-picked articles';
    displayName: 'Desk';
    icon: 'file';
  };
  attributes: {
    articles: Schema.Attribute.Relation<'oneToMany', 'api::article.article'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsDeskGroup extends Struct.ComponentSchema {
  collectionName: 'components_sections_desk_groups';
  info: {
    description: 'Several columns of hand-picked articles (e.g. Africa Times)';
    displayName: 'Desks';
    icon: 'apps';
  };
  attributes: {
    desks: Schema.Attribute.Component<'sections.desk', true>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsInsightList extends Struct.ComponentSchema {
  collectionName: 'components_sections_insight_lists';
  info: {
    description: 'Hand-picked insights for a section';
    displayName: 'Insight picks';
    icon: 'lightbulb';
  };
  attributes: {
    insights: Schema.Attribute.Relation<'oneToMany', 'api::insight.insight'>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsItemGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_item_grids';
  info: {
    description: 'A heading with a grid of short items';
    displayName: 'Item grid';
    icon: 'grid';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.text-item', true>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SectionsPeople extends Struct.ComponentSchema {
  collectionName: 'components_sections_peoples';
  info: {
    description: 'A heading with a grid of people';
    displayName: 'People';
    icon: 'user';
  };
  attributes: {
    people: Schema.Attribute.Component<'shared.person', true>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTextColumns extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_columnss';
  info: {
    description: 'A heading with two columns of text';
    displayName: 'Text columns';
    icon: 'paragraph';
  };
  attributes: {
    left: Schema.Attribute.Text;
    note: Schema.Attribute.String;
    right: Schema.Attribute.Text;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SharedPerson extends Struct.ComponentSchema {
  collectionName: 'components_shared_persons';
  info: {
    description: 'A team member';
    displayName: 'Person';
    icon: 'user';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    initials: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 3;
      }>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String;
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

export interface SharedTextItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_items';
  info: {
    description: 'A short heading with one line of text';
    displayName: 'Text item';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'sections.article-list': SectionsArticleList;
      'sections.desk': SectionsDesk;
      'sections.desk-group': SectionsDeskGroup;
      'sections.insight-list': SectionsInsightList;
      'sections.item-grid': SectionsItemGrid;
      'sections.people': SectionsPeople;
      'sections.text-columns': SectionsTextColumns;
      'shared.energy-mix': SharedEnergyMix;
      'shared.footer-column': SharedFooterColumn;
      'shared.link': SharedLink;
      'shared.meta-social': SharedMetaSocial;
      'shared.person': SharedPerson;
      'shared.seo': SharedSeo;
      'shared.stat': SharedStat;
      'shared.text-item': SharedTextItem;
    }
  }
}
