import { save, type Lang } from './save';

// Interface texts in 4 languages (English first).

const T = {
  en: {
    t_dough: 'Tap the dough to start a pizza',
    t_sauce: 'Tap the sauce pot to spread tomato sauce',
    t_cheese: 'Now tap the cheese bowl',
    t_top: 'This customer wants this topping: tap its bowl',
    t_oven: 'Tap the pizza to put it in the oven',
    t_wait: 'Wait until the crust is golden',
    t_out: 'Golden! Tap it to take it out of the oven',
    t_serve: 'Tap the pizza to serve it!',
    t_burnt: 'Burnt! Tap it to throw it away',
    double: 'Double coins', privacy: 'Privacy options', manage: 'Manage', policy: 'Privacy policy', open: 'Open',
    shoo: 'Shoo!',
    world: 'World tour', shop: 'Upgrades', max: 'MAX', streak: 'Day streak', daily: 'Daily reward', claim: 'Collect',
    up_grill: 'Hot grill', upd_grill: 'Food cooks faster', up_patience: 'Comfy queue', upd_patience: 'Customers wait longer',
    up_tips: 'Big tips', upd_tips: 'Happy customers tip more', up_price: 'Gourmet recipe', upd_price: 'Every dish sells for more',
    play: 'Play', levels: 'New York', level: 'Level', target: 'Goal', time: 'Time',
    paused: 'Paused', resume: 'Resume', quit: 'Quit', retry: 'Retry', next: 'Next', menu: 'Menu',
    settings: 'Settings', sound: 'Sound', music: 'Music', haptics: 'Vibration', language: 'Language', back: 'Back',
    timeUp: "Time's up!", earned: 'Earned', served: 'Served', lost: 'Left angry', failed: 'Goal not reached',
    tapStart: 'Tap to start',
    perfect: 'Perfect!', combo: 'Combo',
  },
  fr: {
    t_dough: 'Touchez la pâte pour commencer une pizza',
    t_sauce: 'Touchez la casserole pour étaler la sauce tomate',
    t_cheese: 'Maintenant, touchez le bol de fromage',
    t_top: 'Ce client veut cette garniture : touchez son bol',
    t_oven: 'Touchez la pizza pour la mettre au four',
    t_wait: 'Attendez que la croûte soit dorée',
    t_out: 'Dorée ! Touchez-la pour la sortir du four',
    t_serve: 'Touchez la pizza pour la servir !',
    t_burnt: 'Brûlée ! Touchez-la pour la jeter',
    double: 'Doubler les pièces', privacy: 'Confidentialité', manage: 'Gérer', policy: 'Politique de confidentialité', open: 'Ouvrir',
    shoo: 'Ouste !',
    world: 'Tour du monde', shop: 'Améliorations', max: 'MAX', streak: 'Jours de suite', daily: 'Cadeau du jour', claim: 'Récupérer',
    up_grill: 'Grill brûlant', upd_grill: 'La cuisson est plus rapide', up_patience: 'File confortable', upd_patience: 'Les clients attendent plus',
    up_tips: 'Gros pourboires', upd_tips: 'Les clients heureux donnent plus', up_price: 'Recette gourmet', upd_price: 'Chaque plat rapporte plus',
    play: 'Jouer', levels: 'New York', level: 'Niveau', target: 'Objectif', time: 'Temps',
    paused: 'Pause', resume: 'Reprendre', quit: 'Quitter', retry: 'Rejouer', next: 'Suivant', menu: 'Menu',
    settings: 'Réglages', sound: 'Son', music: 'Musique', haptics: 'Vibration', language: 'Langue', back: 'Retour',
    timeUp: 'Temps écoulé !', earned: 'Gagné', served: 'Servis', lost: 'Partis fâchés', failed: 'Objectif non atteint',
    tapStart: 'Touchez pour commencer',
    perfect: 'Parfait !', combo: 'Combo',
  },
  es: {
    t_dough: 'Toca la masa para empezar una pizza',
    t_sauce: 'Toca la olla para poner salsa de tomate',
    t_cheese: 'Ahora toca el bol de queso',
    t_top: 'Este cliente quiere este ingrediente: toca su bol',
    t_oven: 'Toca la pizza para meterla al horno',
    t_wait: 'Espera a que el borde esté dorado',
    t_out: '¡Dorada! Tócala para sacarla del horno',
    t_serve: '¡Toca la pizza para servirla!',
    t_burnt: '¡Quemada! Tócala para tirarla',
    double: 'Duplicar monedas', privacy: 'Privacidad', manage: 'Gestionar', policy: 'Política de privacidad', open: 'Abrir',
    shoo: '¡Fuera!',
    world: 'Vuelta al mundo', shop: 'Mejoras', max: 'MÁX', streak: 'Días seguidos', daily: 'Regalo diario', claim: 'Recoger',
    up_grill: 'Parrilla potente', upd_grill: 'La comida se cocina más rápido', up_patience: 'Fila cómoda', upd_patience: 'Los clientes esperan más',
    up_tips: 'Buenas propinas', upd_tips: 'Los clientes felices dan más propina', up_price: 'Receta gourmet', upd_price: 'Cada plato se vende más caro',
    play: 'Jugar', levels: 'Nueva York', level: 'Nivel', target: 'Meta', time: 'Tiempo',
    paused: 'Pausa', resume: 'Seguir', quit: 'Salir', retry: 'Repetir', next: 'Siguiente', menu: 'Menú',
    settings: 'Ajustes', sound: 'Sonido', music: 'Música', haptics: 'Vibración', language: 'Idioma', back: 'Volver',
    timeUp: '¡Se acabó el tiempo!', earned: 'Ganado', served: 'Servidos', lost: 'Se fueron enojados', failed: 'Meta no alcanzada',
    tapStart: 'Toca para empezar',
    perfect: '¡Perfecto!', combo: 'Combo',
  },
  ar: {
    t_dough: 'المس العجين لتبدأ بيتزا',
    t_sauce: 'المس قدر الصلصة لتضع صلصة الطماطم',
    t_cheese: 'الآن المس وعاء الجبن',
    t_top: 'هذا الزبون يريد هذه الإضافة: المس وعاءها',
    t_oven: 'المس البيتزا لتضعها في الفرن',
    t_wait: 'انتظر حتى تصبح الحافة ذهبية',
    t_out: 'ذهبية! المسها لتخرجها من الفرن',
    t_serve: 'المس البيتزا لتقدّمها!',
    t_burnt: 'احترقت! المسها لترميها',
    double: 'ضاعف العملات', privacy: 'خيارات الخصوصية', manage: 'إدارة', policy: 'سياسة الخصوصية', open: 'افتح',
    shoo: 'اذهب!',
    world: 'جولة حول العالم', shop: 'الترقيات', max: 'الأقصى', streak: 'أيام متتالية', daily: 'هدية اليوم', claim: 'خذها',
    up_grill: 'شواية قوية', upd_grill: 'الطبخ أسرع', up_patience: 'طابور مريح', upd_patience: 'الزبائن ينتظرون أكثر',
    up_tips: 'بقشيش كبير', upd_tips: 'الزبائن السعداء يعطون أكثر', up_price: 'وصفة فاخرة', upd_price: 'كل طبق يُباع بثمن أعلى',
    play: 'العب', levels: 'نيويورك', level: 'المستوى', target: 'الهدف', time: 'الوقت',
    paused: 'إيقاف مؤقت', resume: 'تابع', quit: 'خروج', retry: 'أعد', next: 'التالي', menu: 'القائمة',
    settings: 'الإعدادات', sound: 'الأصوات', music: 'الموسيقى', haptics: 'الاهتزاز', language: 'اللغة', back: 'رجوع',
    timeUp: 'انتهى الوقت!', earned: 'الأرباح', served: 'زبائن مخدومون', lost: 'غادروا غاضبين', failed: 'لم تصل إلى الهدف',
    tapStart: 'المس للبدء',
    perfect: 'ممتاز!', combo: 'كومبو',
  },
} as const;

export type Key = keyof typeof T.en;
export const LANGS: { id: Lang; name: string }[] = [
  { id: 'en', name: 'English' }, { id: 'fr', name: 'Français' }, { id: 'es', name: 'Español' }, { id: 'ar', name: 'العربية' },
];

export const t = (k: Key) => T[save.settings.lang][k] ?? T.en[k];

/** Fills every element that has data-t="key", and sets text direction */
export function applyLang() {
  document.documentElement.lang = save.settings.lang;
  document.documentElement.dir = save.settings.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll<HTMLElement>('[data-t]').forEach(el => { el.textContent = t(el.dataset.t as Key); });
}
