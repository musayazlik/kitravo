import type { Locale } from "@/i18n/config";

export type TemplateId = "verify" | "reset" | "contact" | "review" | "admin";

/** What a template says in one language. `{name}` is filled in when the email is sent. */
export type TemplateText = { subject: string; heading: string; body: string; cta?: string };

export type Template = {
  id: TemplateId;
  enabled: boolean;
  /** Every recipient gets the email in their own language; a missing translation falls back to English. */
  translations: Partial<Record<Locale, TemplateText>>;
};

export const templates: Template[] = [
  {
    id: "verify",
    enabled: true,
    translations: {
      en: { subject: "Confirm your email for Kitravo", heading: "Confirm your email", body: "Click the button to confirm this address. The link works for 24 hours.", cta: "Confirm email" },
      tr: { subject: "Kitravo için e-postanızı doğrulayın", heading: "E-postanızı doğrulayın", body: "Bu adresi doğrulamak için düğmeye tıklayın. Bağlantı 24 saat geçerlidir.", cta: "E-postayı doğrula" },
      de: { subject: "Bestätigen Sie Ihre E-Mail-Adresse für Kitravo", heading: "Bestätigen Sie Ihre E-Mail-Adresse", body: "Klicken Sie auf die Schaltfläche, um diese Adresse zu bestätigen. Der Link ist 24 Stunden gültig.", cta: "E-Mail bestätigen" },
      ar: { subject: "أكّد بريدك الإلكتروني في Kitravo", heading: "أكّد بريدك الإلكتروني", body: "انقر على الزر لتأكيد هذا العنوان. الرابط صالح لمدة 24 ساعة.", cta: "تأكيد البريد" },
      zh: { subject: "确认你在 Kitravo 的邮箱", heading: "确认你的邮箱", body: "点击按钮确认此邮箱地址。链接 24 小时内有效。", cta: "确认邮箱" },
    },
  },
  {
    id: "reset",
    enabled: true,
    translations: {
      en: { subject: "Reset your Kitravo password", heading: "Reset your password", body: "We received a request to reset your password. If it wasn't you, ignore this email.", cta: "Choose a new password" },
      tr: { subject: "Kitravo şifrenizi sıfırlayın", heading: "Şifrenizi sıfırlayın", body: "Şifrenizi sıfırlamak için bir istek aldık. Bu siz değilseniz bu e-postayı dikkate almayın.", cta: "Yeni şifre belirle" },
      de: { subject: "Setzen Sie Ihr Kitravo-Passwort zurück", heading: "Passwort zurücksetzen", body: "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Wenn Sie das nicht waren, ignorieren Sie diese E-Mail.", cta: "Neues Passwort festlegen" },
      ar: { subject: "أعد تعيين كلمة مرور Kitravo", heading: "أعد تعيين كلمة المرور", body: "تلقّينا طلبًا لإعادة تعيين كلمة المرور. إن لم تكن أنت من طلب ذلك، فتجاهل هذه الرسالة.", cta: "اختيار كلمة مرور جديدة" },
      zh: { subject: "重置你的 Kitravo 密码", heading: "重置密码", body: "我们收到了重置你密码的请求。如果不是你本人操作，请忽略此邮件。", cta: "设置新密码" },
    },
  },
  {
    id: "contact",
    enabled: true,
    translations: {
      en: { subject: "We got your message", heading: "Thanks, we got your message", body: "We reply to every inquiry within one working day. Your message is below for reference." },
      tr: { subject: "Mesajınızı aldık", heading: "Teşekkürler, mesajınızı aldık", body: "Her talebe bir iş günü içinde yanıt veriyoruz. Mesajınız referans için aşağıda." },
      de: { subject: "Wir haben Ihre Nachricht erhalten", heading: "Danke, wir haben Ihre Nachricht erhalten", body: "Wir beantworten jede Anfrage innerhalb eines Werktags. Ihre Nachricht finden Sie unten zur Referenz." },
      ar: { subject: "وصلتنا رسالتك", heading: "شكرًا، وصلتنا رسالتك", body: "نرد على كل استفسار خلال يوم عمل واحد. تجد رسالتك أدناه للرجوع إليها." },
      zh: { subject: "我们已收到你的消息", heading: "谢谢，我们已收到你的消息", body: "我们会在一个工作日内回复每一条咨询。你的消息附在下方以供参考。" },
    },
  },
  {
    id: "review",
    enabled: false,
    translations: {
      en: { subject: "Your review is live", heading: "Your review is live", body: "Thanks for taking the time. Your review now appears on the product page.", cta: "See your review" },
      tr: { subject: "Değerlendirmeniz yayında", heading: "Değerlendirmeniz yayında", body: "Zaman ayırdığınız için teşekkürler. Değerlendirmeniz artık ürün sayfasında görünüyor.", cta: "Değerlendirmenizi görün" },
      de: { subject: "Ihre Bewertung ist online", heading: "Ihre Bewertung ist online", body: "Danke, dass Sie sich die Zeit genommen haben. Ihre Bewertung erscheint jetzt auf der Produktseite.", cta: "Bewertung ansehen" },
      ar: { subject: "تقييمك منشور الآن", heading: "تقييمك منشور الآن", body: "شكرًا لوقتك. يظهر تقييمك الآن في صفحة المنتج.", cta: "عرض تقييمك" },
      zh: { subject: "你的评价已上线", heading: "你的评价已上线", body: "感谢你抽出时间。你的评价现已显示在产品页面上。", cta: "查看你的评价" },
    },
  },
  {
    id: "admin",
    enabled: true,
    translations: {
      en: { subject: "New inquiry from {name}", heading: "Something needs you", body: "A new contact inquiry arrived. Open the inbox to read and reply.", cta: "Open inbox" },
      tr: { subject: "{name} adlı kişiden yeni talep", heading: "Sizi bekleyen bir şey var", body: "Yeni bir iletişim talebi geldi. Okuyup yanıtlamak için gelen kutusunu açın.", cta: "Gelen kutusunu aç" },
      de: { subject: "Neue Anfrage von {name}", heading: "Etwas wartet auf Sie", body: "Eine neue Kontaktanfrage ist eingegangen. Öffnen Sie den Posteingang, um sie zu lesen und zu beantworten.", cta: "Posteingang öffnen" },
      ar: { subject: "استفسار جديد من {name}", heading: "هناك ما ينتظرك", body: "وصل استفسار تواصل جديد. افتح صندوق الوارد لقراءته والرد عليه.", cta: "فتح صندوق الوارد" },
      zh: { subject: "来自 {name} 的新咨询", heading: "有事等你处理", body: "收到一条新的联系咨询。打开收件箱阅读并回复。", cta: "打开收件箱" },
    },
  },
];

export type LogEntry = { id: string; to: string; template: TemplateId; locale: Locale; status: "delivered" | "opened" | "bounced"; at: string };

export const deliveryLog: LogEntry[] = [
  { id: "l1", to: "k.vogel@studio-nord.de", template: "contact", locale: "de", status: "opened", at: "2026-10-18T08:14:30Z" },
  { id: "l2", to: "musa@kitravo.com", template: "admin", locale: "tr", status: "delivered", at: "2026-10-18T08:14:31Z" },
  { id: "l3", to: "tobias@brandt-webwerk.de", template: "contact", locale: "de", status: "delivered", at: "2026-10-17T16:40:20Z" },
  { id: "l4", to: "m.richter@outlook.de", template: "contact", locale: "de", status: "bounced", at: "2026-10-17T11:02:00Z" },
  { id: "l5", to: "selin@agentur-demir.de", template: "verify", locale: "tr", status: "delivered", at: "2026-10-16T09:31:00Z" },
  { id: "l6", to: "j.koch@outlook.de", template: "contact", locale: "de", status: "bounced", at: "2026-10-15T15:45:00Z" },
  { id: "l7", to: "paul@neumann.io", template: "reset", locale: "en", status: "opened", at: "2026-10-14T19:20:00Z" },
];
