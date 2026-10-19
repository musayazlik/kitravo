import type { Locale } from "@/i18n/config";

/**
 * Demo article body per language. Real posts store the editor's HTML for
 * each translation; this builds a plausible article so every page reads
 * well. `{category}` is replaced with the post's category name.
 */
export const articleBodies: Record<Locale, string> = {
  en: `
<p>This piece collects what we learned doing it on real client projects, in the order we would do it again. None of it is clever; all of it has saved us time at least once.</p>
<h2>Where it usually goes wrong</h2>
<p>Most problems are not technical. They come from starting without an inventory, changing several things at once and finding out about a dependency on launch day. Writing the plan down first turns a risky week into a predictable one.</p>
<blockquote>Do the boring part first. It is the part that decides whether the interesting part works.</blockquote>
<h2>The checklist we use</h2>
<ul>
<li>List what exists today, including the parts nobody remembers adding.</li>
<li>Decide what has to stay identical and what may change.</li>
<li>Change one layer at a time and check after each step.</li>
<li>Keep a short log, so the next person does not have to rediscover it.</li>
</ul>
<h2>A small example</h2>
<p>Here is the shape of the configuration we start from. It is deliberately minimal; every extra line should have a reason.</p>
<pre><code>imports:
  - { resource: 'EXT:sitepackage/Configuration/Sets/Base/settings.yaml' }
settings:
  website.language: en
  website.cache: aggressive</code></pre>
<h3>What to measure</h3>
<p>Pick two or three numbers before you begin and compare them afterwards: time to first byte, largest contentful paint and the number of editor complaints in the first week. If none of them got worse, the change was a success.</p>
<hr>
<p>More posts like this live under <strong>{category}</strong>. If you try this on a project of your own, tell us how it went in the comments.</p>`,
  tr: `
<p>Bu yazı, gerçek müşteri projelerinde öğrendiklerimizi, bir daha yapsak izleyeceğimiz sırayla bir araya getiriyor. Hiçbiri dâhiyane değil; hepsi bize en az bir kez zaman kazandırdı.</p>
<h2>İşler genellikle nerede ters gider</h2>
<p>Sorunların çoğu teknik değildir. Envanter çıkarmadan başlamaktan, aynı anda birden çok şeyi değiştirmekten ve bir bağımlılığı yayın günü fark etmekten kaynaklanır. Planı önce yazıya dökmek, riskli bir haftayı öngörülebilir bir haftaya dönüştürür.</p>
<blockquote>Önce sıkıcı kısmı yapın. İlginç kısmın işe yarayıp yaramayacağına o karar verir.</blockquote>
<h2>Kullandığımız kontrol listesi</h2>
<ul>
<li>Bugün var olan her şeyi listeleyin; kimsenin eklediğini hatırlamadığı parçalar dahil.</li>
<li>Neyin aynen kalması, neyin değişebileceğine karar verin.</li>
<li>Her seferinde tek bir katmanı değiştirin ve her adımdan sonra kontrol edin.</li>
<li>Kısa bir günlük tutun; bir sonraki kişi her şeyi yeniden keşfetmek zorunda kalmasın.</li>
</ul>
<h2>Küçük bir örnek</h2>
<p>Başlangıç noktamız olan yapılandırma şöyle görünüyor. Kasıtlı olarak minimal; her ek satırın bir gerekçesi olmalı.</p>
<pre><code>imports:
  - { resource: 'EXT:sitepackage/Configuration/Sets/Base/settings.yaml' }
settings:
  website.language: tr
  website.cache: aggressive</code></pre>
<h3>Neyi ölçmeli</h3>
<p>Başlamadan önce iki üç sayı seçin ve sonrasında karşılaştırın: ilk bayta kadar geçen süre, en büyük içerikli boyama ve ilk haftadaki editör şikâyeti sayısı. Hiçbiri kötüleşmediyse değişiklik başarılı olmuştur.</p>
<hr>
<p>Bunun gibi diğer yazılar <strong>{category}</strong> altında. Bunu kendi projenizde denerseniz nasıl gittiğini yorumlarda anlatın.</p>`,
  de: `
<p>Dieser Beitrag sammelt, was wir bei echten Kundenprojekten gelernt haben – in der Reihenfolge, in der wir es wieder tun würden. Nichts davon ist raffiniert; alles hat uns mindestens einmal Zeit gespart.</p>
<h2>Wo es meistens schiefgeht</h2>
<p>Die meisten Probleme sind nicht technisch. Sie entstehen, wenn man ohne Bestandsaufnahme startet, mehrere Dinge gleichzeitig ändert und erst am Launch-Tag von einer Abhängigkeit erfährt. Wer den Plan zuerst aufschreibt, macht aus einer riskanten Woche eine planbare.</p>
<blockquote>Erledigen Sie zuerst den langweiligen Teil. Er entscheidet, ob der spannende Teil funktioniert.</blockquote>
<h2>Unsere Checkliste</h2>
<ul>
<li>Erfassen Sie, was heute existiert – auch die Teile, an deren Einbau sich niemand erinnert.</li>
<li>Legen Sie fest, was identisch bleiben muss und was sich ändern darf.</li>
<li>Ändern Sie immer nur eine Ebene und prüfen Sie nach jedem Schritt.</li>
<li>Führen Sie ein kurzes Protokoll, damit die nächste Person nichts neu herausfinden muss.</li>
</ul>
<h2>Ein kleines Beispiel</h2>
<p>So sieht die Konfiguration aus, mit der wir starten. Sie ist bewusst minimal; jede zusätzliche Zeile braucht einen Grund.</p>
<pre><code>imports:
  - { resource: 'EXT:sitepackage/Configuration/Sets/Base/settings.yaml' }
settings:
  website.language: de
  website.cache: aggressive</code></pre>
<h3>Was Sie messen sollten</h3>
<p>Wählen Sie vor dem Start zwei oder drei Kennzahlen und vergleichen Sie sie danach: Time to First Byte, Largest Contentful Paint und die Zahl der Beschwerden aus der Redaktion in der ersten Woche. Ist keine davon schlechter geworden, war die Änderung ein Erfolg.</p>
<hr>
<p>Weitere Beiträge dieser Art finden Sie unter <strong>{category}</strong>. Wenn Sie das in einem eigenen Projekt ausprobieren, erzählen Sie uns in den Kommentaren, wie es lief.</p>`,
  ar: `
<p>تجمع هذه المقالة ما تعلمناه من مشاريع حقيقية لعملائنا، بالترتيب الذي سنتبعه لو أعدنا الكرّة. لا شيء منها عبقري، لكن كل خطوة وفّرت علينا وقتًا مرة واحدة على الأقل.</p>
<h2>أين تسوء الأمور عادةً</h2>
<p>معظم المشكلات ليست تقنية. إنها تنشأ من البدء دون جرد، وتغيير عدة أشياء في آن واحد، واكتشاف اعتمادية ما في يوم الإطلاق. كتابة الخطة أولًا تحوّل أسبوعًا محفوفًا بالمخاطر إلى أسبوع يمكن التنبؤ به.</p>
<blockquote>ابدأ بالجزء الممل. فهو الذي يقرر ما إذا كان الجزء المثير سينجح.</blockquote>
<h2>قائمة التحقق التي نستخدمها</h2>
<ul>
<li>دوّن كل ما هو موجود اليوم، بما في ذلك الأجزاء التي لا يتذكر أحد إضافتها.</li>
<li>حدّد ما يجب أن يبقى كما هو وما يمكن أن يتغير.</li>
<li>غيّر طبقة واحدة في كل مرة وتحقق بعد كل خطوة.</li>
<li>احتفظ بسجل قصير حتى لا يضطر الشخص التالي إلى اكتشاف كل شيء من جديد.</li>
</ul>
<h2>مثال صغير</h2>
<p>هذا شكل الإعدادات التي ننطلق منها. إنها مقتضبة عن قصد؛ وكل سطر إضافي يجب أن يكون له سبب.</p>
<pre dir="ltr"><code>imports:
  - { resource: 'EXT:sitepackage/Configuration/Sets/Base/settings.yaml' }
settings:
  website.language: ar
  website.cache: aggressive</code></pre>
<h3>ما الذي يجب قياسه</h3>
<p>اختر رقمين أو ثلاثة قبل أن تبدأ وقارنها بعد ذلك: زمن وصول أول بايت، وزمن عرض أكبر عنصر محتوى، وعدد شكاوى المحررين في الأسبوع الأول. إن لم يسُؤ أيٌّ منها، فقد نجح التغيير.</p>
<hr>
<p>مقالات أخرى من هذا النوع تجدها ضمن <strong>{category}</strong>. وإن جرّبت هذا في مشروعك، فأخبرنا في التعليقات كيف جرى الأمر.</p>`,
  zh: `
<p>这篇文章汇总了我们在真实客户项目中学到的东西，并按我们再做一次时会采用的顺序排列。没有什么高明之处，但每一条都至少为我们节省过一次时间。</p>
<h2>通常在哪里出问题</h2>
<p>大多数问题都不是技术问题。它们来自没有盘点就开工、同时改动多处，以及在上线当天才发现某个依赖。先把计划写下来，就能把充满风险的一周变成可预期的一周。</p>
<blockquote>先做枯燥的部分。它决定了有趣的部分能否成功。</blockquote>
<h2>我们使用的检查清单</h2>
<ul>
<li>列出现有的一切，包括没人记得是谁加的部分。</li>
<li>确定哪些必须保持不变，哪些可以改动。</li>
<li>每次只改动一层，并在每一步之后检查。</li>
<li>保留一份简短的日志，让下一个人不必从头摸索。</li>
</ul>
<h2>一个小例子</h2>
<p>这是我们起步时使用的配置形态。它刻意保持精简，每多一行都应该有理由。</p>
<pre><code>imports:
  - { resource: 'EXT:sitepackage/Configuration/Sets/Base/settings.yaml' }
settings:
  website.language: zh
  website.cache: aggressive</code></pre>
<h3>应该衡量什么</h3>
<p>开始之前选定两三个指标，之后再做对比：首字节时间、最大内容绘制，以及第一周编辑的投诉数量。如果没有一项变差，这次改动就是成功的。</p>
<hr>
<p>更多类似文章请见 <strong>{category}</strong>。如果你在自己的项目中尝试了这些方法，欢迎在评论中告诉我们效果如何。</p>`,
};
