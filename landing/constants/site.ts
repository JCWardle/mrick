export const SITE_CONFIG = {
  name: 'Peek',
  tagline: 'Discover what you both want, without the awkward conversation',
  subtitle: 'The playful way to explore intimacy together',
  url: 'https://peek.app',
  links: {
    appStore: '',
    playStore: '',
  },
  messaging: {
    hero: 'Finally, a way to talk about what you both want',
    heroSub: 'Swipe through intimacy topics. Match with your partner. Explore together.',
    trust: '100% Private • End-to-End Encrypted',
  },
  features: [
    {
      title: 'Private Discovery',
      description: 'Explore your interests without judgment',
      icon: '🔒',
    },
    {
      title: 'Partner Matching',
      description: 'Compare profiles to find shared interests and boundaries',
      icon: '💑',
    },
    {
      title: 'Privacy First',
      description: 'End-to-end encrypted, zero contact syncing, full data control',
      icon: '🛡️',
    },
    {
      title: 'AI Suggestions',
      description: 'Personalized ideas based on your shared interests',
      icon: '✨',
    },
    {
      title: 'Educational Content',
      description: 'Non-judgmental articles and guides',
      icon: '📚',
    },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Discover Privately',
      description: 'Swipe through intimacy topics at your own pace (Super Yum, Yum, Open, or Ick)',
    },
    {
      step: 2,
      title: 'Share What You Want',
      description: 'Choose what level of detail to share with your partner',
    },
    {
      step: 3,
      title: 'See Your Matches',
      description: 'Discover shared interests, boundaries, and opportunities for exploration',
    },
  ],
  pricing: {
    free: {
      name: 'Free',
      features: [
        'Personal discovery journey',
        'Basic content',
        '1 saved profile',
      ],
    },
    premium: {
      name: 'Premium (Couple Bundle)',
      price: 'Coming Soon',
      features: [
        'Partner matching',
        'AI suggestions',
        'Specialist content',
        'Weekly prompts',
        'Relationship insights',
      ],
      marketing: "Perfect anniversary / Valentine's / 'spice it up' gift",
    },
  },
  trust: [
    'End-to-end encrypted partner sharing',
    'Zero contact syncing',
    'Full data deletion on request',
    'Your data belongs to you',
    'App Store approved content',
  ],
} as const;

