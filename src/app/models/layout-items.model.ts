export interface NavLink {
  title: string;
  link: string;
}

export interface navBarItems {
  id: string;      // ID do documento (ex: 'connectivity')
  title: string;   // Nome dinâmico da categoria (ex: 'Connectivity')
  order: number;   // Prioridade de exibição na tela
  link: string;    // Link principal da categoria (ex: '/connectivity')
  items: NavLink[]; // Array de links desta categoria
}

export type FooterSection = 'useful_links' | 'policies' | 'about_us' | 'offices';

export interface FooterSectionOption {
  value: FooterSection;
  label: string;
}

export const FOOTER_SECTIONS: FooterSectionOption[] = [
  { value: 'useful_links', label: 'Links Úteis (Useful Links)' },
  { value: 'policies', label: 'Nossas Políticas (Policies Submenu)' },
  { value: 'about_us', label: 'Sobre Nós (About Us)' },
  { value: 'offices', label: 'Escritórios (Offices)' }
];

export interface footerItems {
  id: string;
  link: string;
  title: string;
  section?: FooterSection;
  order?: number;
  translateKey?: string;
  targetBlank?: boolean;
}

export const DEFAULT_FOOTER_ITEMS: footerItems[] = [
  // Column 2: Useful Links (Links Úteis)
  {
    id: 'footer-useful-1',
    title: 'Listas da Comunidade BGP',
    translateKey: 'communityLists.footerLink',
    link: '/community-lists',
    section: 'useful_links',
    order: 1,
    targetBlank: false
  },
  {
    id: 'footer-useful-2',
    title: 'Angonix',
    link: 'https://www.angonix.net/',
    section: 'useful_links',
    order: 2,
    targetBlank: false
  },
  {
    id: 'footer-useful-3',
    title: 'Clouds2Africa',
    link: 'https://clouds2africa.com/#!/',
    section: 'useful_links',
    order: 3,
    targetBlank: false
  },
  {
    id: 'footer-useful-4',
    title: 'Termos e Condições',
    translateKey: 'termos.condicoes',
    link: '',
    section: 'useful_links',
    order: 4,
    targetBlank: false
  },
  {
    id: 'footer-useful-5',
    title: 'Canal de Denúncias',
    translateKey: 'canal.denuncias',
    link: 'https://portaldenuncias.angolacables.co.ao/',
    section: 'useful_links',
    order: 5,
    targetBlank: true
  },

  // Column 2 Submenu: Our Policies (Nossas Políticas)
  {
    id: 'footer-policy-1',
    title: 'Política de Privacidade',
    link: '/privacy-policies',
    section: 'policies',
    order: 1,
    targetBlank: false
  },
  {
    id: 'footer-policy-2',
    title: 'Política de Cookies',
    link: '/cookies-policies',
    section: 'policies',
    order: 2,
    targetBlank: false
  },
  {
    id: 'footer-policy-3',
    title: 'Política do Sistema de Gestão Integrado',
    link: 'https://angolacables.com/sgi',
    section: 'policies',
    order: 3,
    targetBlank: true
  },
  {
    id: 'footer-policy-4',
    title: 'Política Anti-Suborno',
    link: 'https://angolacables.com/anti',
    section: 'policies',
    order: 4,
    targetBlank: true
  },
  {
    id: 'footer-policy-5',
    title: 'Política de Continuidade de Negócios',
    link: 'https://angolacables.com/politicas-cont-negocios',
    section: 'policies',
    order: 5,
    targetBlank: true
  },
  {
    id: 'footer-policy-6',
    title: 'Política de Aquisição e Relacionamento com Fornecedores',
    link: 'https://angolacables.com/politicas-contrat',
    section: 'policies',
    order: 6,
    targetBlank: true
  },
  {
    id: 'footer-policy-7',
    title: 'Política de Identificação, Aceitação e Due Diligence de Clientes e Parceiros',
    link: 'https://angolacables.com/politicas-id-dued',
    section: 'policies',
    order: 7,
    targetBlank: true
  },
  {
    id: 'footer-policy-8',
    title: 'Política de Segurança da Informação para Fornecedores e Prestadores',
    link: 'https://angolacables.com/politicas-seginf',
    section: 'policies',
    order: 8,
    targetBlank: true
  },
  {
    id: 'footer-policy-9',
    title: 'Listas da Comunidade BGP',
    translateKey: 'communityLists.footerLink',
    link: '/community-lists',
    section: 'policies',
    order: 9,
    targetBlank: false
  },

  // Column 3: About Us (Sobre Nós)
  {
    id: 'footer-about-1',
    title: 'Conheça-nos',
    translateKey: 'menu-conheca',
    link: '/sobre',
    section: 'about_us',
    order: 1,
    targetBlank: false
  },
  {
    id: 'footer-about-2',
    title: 'Eventos',
    translateKey: 'menu-eventos',
    link: '/eventos',
    section: 'about_us',
    order: 2,
    targetBlank: false
  },
  {
    id: 'footer-about-3',
    title: 'Blog',
    translateKey: 'menu-blog',
    link: '/blog',
    section: 'about_us',
    order: 3,
    targetBlank: false
  },
  {
    id: 'footer-about-4',
    title: 'Notícias',
    translateKey: 'menu-noticias',
    link: '/noticias',
    section: 'about_us',
    order: 4,
    targetBlank: false
  },
  {
    id: 'footer-about-5',
    title: 'Trust Center',
    translateKey: 'menu-trust',
    link: '/trust-center',
    section: 'about_us',
    order: 5,
    targetBlank: false
  },
  {
    id: 'footer-about-6',
    title: 'Recrutamento',
    translateKey: 'menu-recrutamento',
    link: '/recrutamento',
    section: 'about_us',
    order: 6,
    targetBlank: false
  },

  // Column 4: Offices (Escritórios)
  {
    id: 'footer-office-1',
    title: 'Angola',
    link: 'https://angolacables.co.ao/',
    section: 'offices',
    order: 1,
    targetBlank: false
  },
  {
    id: 'footer-office-2',
    title: 'África do Sul',
    link: 'https://telcables.co.za/',
    section: 'offices',
    order: 2,
    targetBlank: false
  },
  {
    id: 'footer-office-3',
    title: 'Brasil',
    link: 'https://telcables.com.br/',
    section: 'offices',
    order: 3,
    targetBlank: false
  },
  {
    id: 'footer-office-4',
    title: 'EUA',
    link: 'https://telcables.net/',
    section: 'offices',
    order: 4,
    targetBlank: false
  },
  {
    id: 'footer-office-5',
    title: 'Nigeria',
    link: 'https://telcables.ng/',
    section: 'offices',
    order: 5,
    targetBlank: false
  },
  {
    id: 'footer-office-6',
    title: 'Portugal',
    link: 'https://telcables.pt/',
    section: 'offices',
    order: 6,
    targetBlank: false
  }
];

export interface siteLogos {
    id : string;
    footerLogoUrl : string;
    navbarLogoUrl: string;
    mobileLogoUrl: string;
}

export interface socialMedia {
    id: string;
    link : string;
    title: string;
}

export interface addresses {
    id: string;
    title: string;
    addressName: string;
    phone?: string;
    contactEmail: string;

}

export interface partners {
    id: string;
    partnersLogo: string;
    partnerUrl: string;
}



export interface heroSlider {
    id: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    ctaBtnText: string;
      ctaBtn2Text: string;
    ctaUrl: string;
    cta2Url: string;

    // Novas propriedades dinâmicas para o motor de vídeo de fundo
    videoUrl?: string;  // Opcional, armazena o link do MP4 no Firestore
    posterUrl?: string; // Opcional, armazena o link da imagem de thumbnail
    upEventImageUrl?: string; // Add this line
    upEventUrl?: string; // Add this line
}

export const SUBSIDIARY_DEFAULT_ADDRESSES: Record<string, addresses[]> = {
  ao: [
    {
      id: 'addr-ao',
      title: 'Angola Cables (HQ)',
      addressName: 'Edifício Luanda Tower, Rua Gamal Abdel Nasser, nº 115, Luanda, Angola',
      phone: '+244 923 166 200',
      contactEmail: 'info@angolacables.co.ao'
    }
  ],
  ng: [
    {
      id: 'addr-ng',
      title: 'TelCables Nigeria (Lagos Office)',
      addressName: 'Plot 1A, Block 129, Jide Oki Street, Victoria Island, Lagos, Nigeria',
      phone: '+234 1 277 0000',
      contactEmail: 'info@telcables.ng'
    }
  ],
  pt: [
    {
      id: 'addr-pt',
      title: 'TelCables Europe (Portugal Office)',
      addressName: 'Rua Laura Ayres, nº 3, 2775-587 Carcavelos, Portugal',
      phone: '+351 210 993 300',
      contactEmail: 'info@telcables.pt'
    }
  ],
  za: [
    {
      id: 'addr-za',
      title: 'TelCables South Africa (Johannesburg Office)',
      addressName: 'The Pivot, Block E, 1st Floor, Montecasino Boulevard, Fourways, Johannesburg, 2055, South Africa',
      phone: '+27 10 020 7700',
      contactEmail: 'info@telcables.co.za'
    }
  ]
};

export const SUBSIDIARY_DEFAULT_LOGOS: Record<string, siteLogos> = {
  ao: {
    id: 'logos-ao',
    navbarLogoUrl: '/img/telcables/svg/ac-teste-2.svg',
    footerLogoUrl: '/img/telcables/svg/ac-teste-2.svg',
    mobileLogoUrl: '/img/telcables/svg/ac-teste-2.svg'
  },
  ng: {
    id: 'logos-ng',
    navbarLogoUrl: '/img/telcables/svg/v2/telcables-nigeria.svg',
    footerLogoUrl: '/img/telcables/svg/v2/telcables-nigeria.svg',
    mobileLogoUrl: '/img/telcables/svg/v2/telcables-nigeria.svg'
  },
  pt: {
    id: 'logos-pt',
    navbarLogoUrl: '/img/telcables/svg/v2/telcables-europa.svg',
    footerLogoUrl: '/img/telcables/svg/v2/telcables-europa.svg',
    mobileLogoUrl: '/img/telcables/svg/v2/telcables-europa.svg'
  },
  za: {
    id: 'logos-za',
    navbarLogoUrl: '/img/telcables/svg/v2/telcables-south-africa.svg',
    footerLogoUrl: '/img/telcables/svg/v2/telcables-south-africa.svg',
    mobileLogoUrl: '/img/telcables/svg/v2/telcables-south-africa.svg'
  }
};

export const SUBSIDIARY_DEFAULT_SOCIAL: Record<string, socialMedia[]> = {
  ao: [
    { id: 'soc-ao-1', title: 'LinkedIn', link: 'https://www.linkedin.com/company/angola-cables/' },
    { id: 'soc-ao-2', title: 'Facebook', link: 'https://www.facebook.com/angolacables/' },
    { id: 'soc-ao-3', title: 'Instagram', link: 'https://www.instagram.com/angolacables/' },
    { id: 'soc-ao-4', title: 'Twitter / X', link: 'https://twitter.com/AngolaCables' },
    { id: 'soc-ao-5', title: 'YouTube', link: 'https://www.youtube.com/@angolacables' }
  ],
  ng: [
    { id: 'soc-ng-1', title: 'LinkedIn', link: 'https://www.linkedin.com/company/telcables-nigeria/' },
    { id: 'soc-ng-2', title: 'Twitter / X', link: 'https://twitter.com/telcables_ng' },
    { id: 'soc-ng-3', title: 'Instagram', link: 'https://www.instagram.com/telcables_ng/' }
  ],
  pt: [
    { id: 'soc-pt-1', title: 'LinkedIn', link: 'https://www.linkedin.com/company/telcables-europe/' },
    { id: 'soc-pt-2', title: 'Twitter / X', link: 'https://twitter.com/telcables_eu' }
  ],
  za: [
    { id: 'soc-za-1', title: 'LinkedIn', link: 'https://www.linkedin.com/company/telcables-south-africa/' },
    { id: 'soc-za-2', title: 'Twitter / X', link: 'https://twitter.com/telcables_sa' }
  ]
};

