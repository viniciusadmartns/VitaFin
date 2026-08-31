import React from 'react';
import {
  // Alimentação & Bebidas
  Utensils,
  UtensilsCrossed,
  ShoppingCart,
  Coffee,
  Pizza,
  Beer,
  Wine,
  Apple,
  Cake,
  IceCream,
  ChefHat,

  // Moradia, Casa & Serviços
  Home,
  Building,
  Building2,
  Key,
  Bed,
  Sofa,
  Lamp,
  Bath,
  Hammer,
  Wrench,
  Flame,
  Droplets,
  Trash2,
  Shield,

  // Transporte & Viagens
  Car,
  Fuel,
  Bus,
  Plane,
  Train,
  Bike,
  Truck,
  Navigation,
  Ship,
  MapPin,
  Ticket,
  Luggage,

  // Saúde, Farmácia & Bem-Estar
  HeartPulse,
  Activity,
  Pill,
  Stethoscope,
  Dumbbell,
  Smile,
  Sparkles,
  Eye,
  Syringe,
  Cross,

  // Entretenimento, Hobbies & Games
  Film,
  Tv,
  Music,
  Gamepad2,
  Headphones,
  Camera,
  PartyPopper,
  Palette,
  Theater,
  Dice5,
  Trophy,
  Radio,

  // Tecnologia & Conectividade
  Smartphone,
  Laptop,
  Monitor,
  Wifi,
  Cloud,
  Server,
  HardDrive,
  Cpu,
  Globe,
  Bot,

  // Compras, Roupas & Estilo
  ShoppingBag,
  Shirt,
  Watch,
  Glasses,
  Scissors,
  Footprints,
  Gem,
  Package,
  Gift,
  Tag,

  // Educação & Trabalho
  GraduationCap,
  BookOpen,
  Briefcase,
  Folder,
  FileText,
  PenTool,
  Calculator,
  Award,
  Library,
  Newspaper,

  // Família & Pets
  Baby,
  PawPrint,
  Dog,
  Cat,
  Heart,
  Users,
  UserPlus,

  // Finanças, Bancos & Contas
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  PiggyBank,
  TrendingUp,
  DollarSign,
  Percent,
  ShieldCheck,
  Scale,
  Landmark,

  // Outros & Gerais
  MoreHorizontal,
  Star,
  Sun,
  Moon,
  Zap,
  Bell,
  Bookmark,
  Compass,
  type LucideIcon,
} from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
  categoryGroup: string;
  icon: LucideIcon;
}

export const AVAILABLE_ICONS: IconOption[] = [
  // Alimentação
  { name: 'utensils', label: 'Restaurante & Refeições', categoryGroup: 'Alimentação', icon: Utensils },
  { name: 'utensils-crossed', label: 'Gastronomia & Jantares', categoryGroup: 'Alimentação', icon: UtensilsCrossed },
  { name: 'shopping-cart', label: 'Supermercado & Feira', categoryGroup: 'Alimentação', icon: ShoppingCart },
  { name: 'coffee', label: 'Cafeteria & Lanches', categoryGroup: 'Alimentação', icon: Coffee },
  { name: 'pizza', label: 'Pizzaria & Delivery / Fast-food', categoryGroup: 'Alimentação', icon: Pizza },
  { name: 'beer', label: 'Bar & Cerveja', categoryGroup: 'Alimentação', icon: Beer },
  { name: 'wine', label: 'Vinho & Bebidas', categoryGroup: 'Alimentação', icon: Wine },
  { name: 'apple', label: 'Hortifruti & Alimentação Saudável', categoryGroup: 'Alimentação', icon: Apple },
  { name: 'cake', label: 'Doceria & Sobremesas / Aniversário', categoryGroup: 'Alimentação', icon: Cake },
  { name: 'ice-cream', label: 'Sorveteria & Açaí', categoryGroup: 'Alimentação', icon: IceCream },
  { name: 'chef-hat', label: 'Cozinha & Culinária', categoryGroup: 'Alimentação', icon: ChefHat },

  // Moradia & Contas
  { name: 'home', label: 'Aluguel & Moradia', categoryGroup: 'Casa & Moradia', icon: Home },
  { name: 'building', label: 'Condomínio & Prédio', categoryGroup: 'Casa & Moradia', icon: Building },
  { name: 'building-2', label: 'Imóvel & IPTU', categoryGroup: 'Casa & Moradia', icon: Building2 },
  { name: 'key', label: 'Chaves & Financiamento Imobiliário', categoryGroup: 'Casa & Moradia', icon: Key },
  { name: 'bed', label: 'Móveis & Quarto', categoryGroup: 'Casa & Moradia', icon: Bed },
  { name: 'sofa', label: 'Decoração & Sala', categoryGroup: 'Casa & Moradia', icon: Sofa },
  { name: 'lamp', label: 'Energia Elétrica (Luz)', categoryGroup: 'Casa & Moradia', icon: Lamp },
  { name: 'droplets', label: 'Conta de Água & Saneamento', categoryGroup: 'Casa & Moradia', icon: Droplets },
  { name: 'flame', label: 'Conta de Gás', categoryGroup: 'Casa & Moradia', icon: Flame },
  { name: 'bath', label: 'Banheiro & Higiene Casa', categoryGroup: 'Casa & Moradia', icon: Bath },
  { name: 'wrench', label: 'Manutenção & Consertos', categoryGroup: 'Casa & Moradia', icon: Wrench },
  { name: 'hammer', label: 'Reforma & Construção', categoryGroup: 'Casa & Moradia', icon: Hammer },
  { name: 'trash-2', label: 'Taxas & Limpeza', categoryGroup: 'Casa & Moradia', icon: Trash2 },
  { name: 'shield', label: 'Segurança Residencial', categoryGroup: 'Casa & Moradia', icon: Shield },

  // Transporte & Veículos
  { name: 'car', label: 'Carro & Automóvel', categoryGroup: 'Transporte', icon: Car },
  { name: 'fuel', label: 'Combustível / Gasolina', categoryGroup: 'Transporte', icon: Fuel },
  { name: 'bus', label: 'Ônibus & Transporte Público', categoryGroup: 'Transporte', icon: Bus },
  { name: 'train', label: 'Metrô & Trem', categoryGroup: 'Transporte', icon: Train },
  { name: 'bike', label: 'Bicicleta & Ciclovia', categoryGroup: 'Transporte', icon: Bike },
  { name: 'plane', label: 'Passagens Aéreas & Viagens', categoryGroup: 'Transporte', icon: Plane },
  { name: 'truck', label: 'Frete & Mudança', categoryGroup: 'Transporte', icon: Truck },
  { name: 'navigation', label: 'GPS / Pedágio / Estacionamento', categoryGroup: 'Transporte', icon: Navigation },
  { name: 'ship', label: 'Cruzeiro & Barco', categoryGroup: 'Transporte', icon: Ship },
  { name: 'luggage', label: 'Bagagem & Hospedagem', categoryGroup: 'Transporte', icon: Luggage },
  { name: 'ticket', label: 'Ingressos & Bilhetes', categoryGroup: 'Transporte', icon: Ticket },
  { name: 'map-pin', label: 'Passeios & Destinos', categoryGroup: 'Transporte', icon: MapPin },

  // Saúde & Bem-estar
  { name: 'heart-pulse', label: 'Plano de Saúde & Consultas', categoryGroup: 'Saúde & Cuidados', icon: HeartPulse },
  { name: 'pill', label: 'Farmácia & Medicamentos', categoryGroup: 'Saúde & Cuidados', icon: Pill },
  { name: 'stethoscope', label: 'Exames & Médicos Especialistas', categoryGroup: 'Saúde & Cuidados', icon: Stethoscope },
  { name: 'dumbbell', label: 'Academia & Treino', categoryGroup: 'Saúde & Cuidados', icon: Dumbbell },
  { name: 'activity', label: 'Esportes & Atividades Físicas', categoryGroup: 'Saúde & Cuidados', icon: Activity },
  { name: 'sparkles', label: 'Salão de Beleza & Estética', categoryGroup: 'Saúde & Cuidados', icon: Sparkles },
  { name: 'smile', label: 'Dentista & Cuidados Pessoais', categoryGroup: 'Saúde & Cuidados', icon: Smile },
  { name: 'eye', label: 'Ótica & Oftalmologista', categoryGroup: 'Saúde & Cuidados', icon: Eye },
  { name: 'syringe', label: 'Vacinas & Tratamentos', categoryGroup: 'Saúde & Cuidados', icon: Syringe },
  { name: 'cross', label: 'Hospital & Emergência', categoryGroup: 'Saúde & Cuidados', icon: Cross },

  // Lazer, Entretenimento & Hobbies
  { name: 'film', label: 'Cinema & Filmes', categoryGroup: 'Lazer & Cultura', icon: Film },
  { name: 'tv', label: 'Streaming (Netflix, HBO, Disney)', categoryGroup: 'Lazer & Cultura', icon: Tv },
  { name: 'music', label: 'Spotify, Shows & Música', categoryGroup: 'Lazer & Cultura', icon: Music },
  { name: 'gamepad-2', label: 'Jogos, Videogame & Steam', categoryGroup: 'Lazer & Cultura', icon: Gamepad2 },
  { name: 'headphones', label: 'Podcasts & Áudio', categoryGroup: 'Lazer & Cultura', icon: Headphones },
  { name: 'camera', label: 'Fotografia & Hobbies', categoryGroup: 'Lazer & Cultura', icon: Camera },
  { name: 'party-popper', label: 'Festas, Baladas & Eventos', categoryGroup: 'Lazer & Cultura', icon: PartyPopper },
  { name: 'palette', label: 'Arte, Desenho & Criação', categoryGroup: 'Lazer & Cultura', icon: Palette },
  { name: 'theater', label: 'Teatro & Espetáculos', categoryGroup: 'Lazer & Cultura', icon: Theater },
  { name: 'trophy', label: 'Competições & Campeonatos', categoryGroup: 'Lazer & Cultura', icon: Trophy },
  { name: 'dice-5', label: 'Jogos de Tabuleiro & Cassino', categoryGroup: 'Lazer & Cultura', icon: Dice5 },
  { name: 'radio', label: 'Rádio & Música Ao Vivo', categoryGroup: 'Lazer & Cultura', icon: Radio },

  // Tecnologia & Conectividade
  { name: 'smartphone', label: 'Celular & Recarga', categoryGroup: 'Tecnologia', icon: Smartphone },
  { name: 'wifi', label: 'Internet Banda Larga', categoryGroup: 'Tecnologia', icon: Wifi },
  { name: 'laptop', label: 'Computador & Notebook', categoryGroup: 'Tecnologia', icon: Laptop },
  { name: 'monitor', label: 'Eletrônicos & Acessórios', categoryGroup: 'Tecnologia', icon: Monitor },
  { name: 'cloud', label: 'Armazenamento em Nuvem & Assinaturas', categoryGroup: 'Tecnologia', icon: Cloud },
  { name: 'server', label: 'Servidores & Infraestrutura', categoryGroup: 'Tecnologia', icon: Server },
  { name: 'hard-drive', label: 'HD, SSD & Armazenamento', categoryGroup: 'Tecnologia', icon: HardDrive },
  { name: 'cpu', label: 'Processador & Hardware', categoryGroup: 'Tecnologia', icon: Cpu },
  { name: 'bot', label: 'Softwares, ChatGPT & IA', categoryGroup: 'Tecnologia', icon: Bot },
  { name: 'globe', label: 'Domínios & Hospedagem Web', categoryGroup: 'Tecnologia', icon: Globe },

  // Compras, Roupas & Estilo
  { name: 'shopping-bag', label: 'Compras Gerais & Shopping', categoryGroup: 'Compras & Estilo', icon: ShoppingBag },
  { name: 'shirt', label: 'Roupas & Vestuário', categoryGroup: 'Compras & Estilo', icon: Shirt },
  { name: 'footprints', label: 'Calçados & Tênis', categoryGroup: 'Compras & Estilo', icon: Footprints },
  { name: 'watch', label: 'Acessórios & Relógios', categoryGroup: 'Compras & Estilo', icon: Watch },
  { name: 'glasses', label: 'Óculos de Sol & Acessórios', categoryGroup: 'Compras & Estilo', icon: Glasses },
  { name: 'scissors', label: 'Cabelereiro & Barbeiro', categoryGroup: 'Compras & Estilo', icon: Scissors },
  { name: 'gem', label: 'Joias & Presentes Especiais', categoryGroup: 'Compras & Estilo', icon: Gem },
  { name: 'gift', label: 'Presentes & Doações', categoryGroup: 'Compras & Estilo', icon: Gift },
  { name: 'package', label: 'Encomendas & Correios', categoryGroup: 'Compras & Estilo', icon: Package },

  // Educação & Trabalho
  { name: 'graduation-cap', label: 'Faculdade, Pós & Escola', categoryGroup: 'Educação & Trabalho', icon: GraduationCap },
  { name: 'book-open', label: 'Livros & Material Escolar', categoryGroup: 'Educação & Trabalho', icon: BookOpen },
  { name: 'briefcase', label: 'Trabalho, Negócios & Empresa', categoryGroup: 'Educação & Trabalho', icon: Briefcase },
  { name: 'folder', label: 'Documentos & Arquivos', categoryGroup: 'Educação & Trabalho', icon: Folder },
  { name: 'file-text', label: 'Contratos & Serviços Jurídicos', categoryGroup: 'Educação & Trabalho', icon: FileText },
  { name: 'pen-tool', label: 'Design & Criação Gráfica', categoryGroup: 'Educação & Trabalho', icon: PenTool },
  { name: 'calculator', label: 'Contabilidade & Impostos', categoryGroup: 'Educação & Trabalho', icon: Calculator },
  { name: 'award', label: 'Certificações & Cursos Online', categoryGroup: 'Educação & Trabalho', icon: Award },
  { name: 'library', label: 'Biblioteca & Pesquisas', categoryGroup: 'Educação & Trabalho', icon: Library },
  { name: 'newspaper', label: 'Jornais & Revistas', categoryGroup: 'Educação & Trabalho', icon: Newspaper },

  // Família & Pets
  { name: 'baby', label: 'Bebê, Filhos & Fraldas', categoryGroup: 'Família & Pets', icon: Baby },
  { name: 'paw-print', label: 'Pet Shop & Cuidados Pet', categoryGroup: 'Família & Pets', icon: PawPrint },
  { name: 'dog', label: 'Cachorro & Veterinário', categoryGroup: 'Família & Pets', icon: Dog },
  { name: 'cat', label: 'Gato & Rações', categoryGroup: 'Família & Pets', icon: Cat },
  { name: 'heart', label: 'Família, Casamento & Relacionamento', categoryGroup: 'Família & Pets', icon: Heart },
  { name: 'users', label: 'Amigos & Despesas Coletivas', categoryGroup: 'Família & Pets', icon: Users },
  { name: 'user-plus', label: 'Inclusão de Dependentes', categoryGroup: 'Família & Pets', icon: UserPlus },

  // Finanças, Bancos & Investimentos
  { name: 'credit-card', label: 'Fatura de Cartão de Crédito', categoryGroup: 'Finanças & Bancos', icon: CreditCard },
  { name: 'wallet', label: 'Carteira & Gastos Diários', categoryGroup: 'Finanças & Bancos', icon: Wallet },
  { name: 'banknote', label: 'Saques & Dinheiro Vivo', categoryGroup: 'Finanças & Bancos', icon: Banknote },
  { name: 'coins', label: 'Moedas & Pequenos Gastos', categoryGroup: 'Finanças & Bancos', icon: Coins },
  { name: 'receipt', label: 'Boletos & Taxas Bancárias', categoryGroup: 'Finanças & Bancos', icon: Receipt },
  { name: 'piggy-bank', label: 'Poupança & Cofrinho', categoryGroup: 'Finanças & Bancos', icon: PiggyBank },
  { name: 'trending-up', label: 'Investimentos & Ações', categoryGroup: 'Finanças & Bancos', icon: TrendingUp },
  { name: 'dollar-sign', label: 'Câmbio, Dólar & Moeda Estrangeira', categoryGroup: 'Finanças & Bancos', icon: DollarSign },
  { name: 'landmark', label: 'Bancos, Empréstimos & Consórcios', categoryGroup: 'Finanças & Bancos', icon: Landmark },
  { name: 'shield-check', label: 'Seguros de Vida & Automóvel', categoryGroup: 'Finanças & Bancos', icon: ShieldCheck },
  { name: 'percent', label: 'Juros & Financiamentos', categoryGroup: 'Finanças & Bancos', icon: Percent },
  { name: 'scale', label: 'Honorários & Processos', categoryGroup: 'Finanças & Bancos', icon: Scale },

  // Outros & Gerais
  { name: 'more-horizontal', label: 'Outros / Diversos', categoryGroup: 'Geral', icon: MoreHorizontal },
  { name: 'star', label: 'Despesas Prioritárias / Destaques', categoryGroup: 'Geral', icon: Star },
  { name: 'sun', label: 'Verão, Praia & Férias', categoryGroup: 'Geral', icon: Sun },
  { name: 'moon', label: 'Vida Noturna & Passeios', categoryGroup: 'Geral', icon: Moon },
  { name: 'zap', label: 'Imprevistos & Urgências', categoryGroup: 'Geral', icon: Zap },
  { name: 'bell', label: 'Lembretes & Avisos', categoryGroup: 'Geral', icon: Bell },
  { name: 'bookmark', label: 'Favoritos & Desejos de Compra', categoryGroup: 'Geral', icon: Bookmark },
  { name: 'compass', label: 'Excursões, Trilhas & Aventuras', categoryGroup: 'Geral', icon: Compass },
  { name: 'tag', label: 'Promoções & Ofertas', categoryGroup: 'Geral', icon: Tag },
];

const iconMap = new Map<string, LucideIcon>(
  AVAILABLE_ICONS.map((item) => [item.name, item.icon])
);

export function getCategoryIcon(name: string): LucideIcon {
  return iconMap.get(name) || MoreHorizontal;
}

export function renderCategoryIcon(
  iconName: string,
  className?: string,
  style?: React.CSSProperties
): React.ReactElement {
  const IconComponent = getCategoryIcon(iconName);
  return React.createElement(IconComponent, { className, style });
}

export const PRESET_COLORS = [
  '#EF4444', // Vermelho Coral
  '#F97316', // Laranja Intenso
  '#F59E0B', // Âmbar / Dourado
  '#EAB308', // Amarelo
  '#10B981', // Esmeralda / Verde
  '#14B8A6', // Verde Turquesa
  '#06B6D4', // Ciano
  '#3B82F6', // Azul Royal
  '#6366F1', // Índigo / Violeta
  '#8B5CF6', // Roxo
  '#D946EF', // Fúcsia
  '#EC4899', // Rosa Pink
  '#F43F5E', // Rosa Framboesa
  '#84CC16', // Verde Lima
  '#059669', // Verde Floresta
  '#0284C7', // Azul Oceano
  '#475569', // Ardósia / Cinza
  '#78716C', // Pedra Neutro
  '#1E293B', // Grafite Escuro
];
