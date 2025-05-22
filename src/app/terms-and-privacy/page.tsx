"use client"

import React from "react"

export default function TermsAndPrivacy() {
  return (
    <div className="max-w-3xl mx-20 px-4 py-10 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">תנאי שימוש</h1>

      <section className="mb-8 space-y-4">
        <p>
          ברוכים הבאים לאתר <strong>blognavon.com</strong> – בְּלוֹג העוסק
          בנושאי בינה מלאכותית (AI), טכנולוגיה וחדשנות.
        </p>

        <h2 className="text-xl font-semibold">1. הסכמה לתנאים</h2>
        <p>
          בשימושך באתר זה, אתה מאשר כי קראת, הבנת והסכמת להיות כפוף לתנאים אלו.
          אם אינך מסכים להם, אנא הימנע מהשימוש באתר.
        </p>

        <h2 className="text-xl font-semibold">2. תוכן האתר</h2>
        <p>
          התכנים באתר נכתבים למטרות מידע, לימוד ודעה בלבד, ואין לראות בהם ייעוץ
          מקצועי מכל סוג שהוא.
        </p>

        <h2 className="text-xl font-semibold">3. קניין רוחני</h2>
        <p>כל הזכויות לתכנים באתר שייכות ל-blognavon.com, אלא אם צוין אחרת.</p>

        <h2 className="text-xl font-semibold">4. תגובות גולשים</h2>
        <p>הינך מוזמן להשאיר תגובות, אך מתבקש לשמור על שיח מכבד.</p>

        <h2 className="text-xl font-semibold">5. קישורים לאתרים חיצוניים</h2>
        <p>אין לנו אחריות על תוכן ומדיניות באתרים חיצוניים המקושרים מהאתר.</p>

        <h2 className="text-xl font-semibold">6. שינוי תנאי השימוש</h2>
        <p>אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת.</p>
      </section>

      <h1 className="text-3xl font-bold mb-6 mt-12">מדיניות פרטיות</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. איסוף מידע</h2>
        <p>
          אנו עשויים לאסוף מידע טכני ונתונים שנמסרים ישירות על ידך, כגון תגובות.
        </p>

        <h2 className="text-xl font-semibold">2. שימוש במידע</h2>
        <p>המידע משמש לניתוח, שיפור חוויית המשתמש, ותקשורת עם הקוראים.</p>

        <h2 className="text-xl font-semibold">3. מסירת מידע לצד שלישי</h2>
        <p>
          איננו מעבירים מידע לצדדים שלישיים, למעט מקרים הנדרשים לפי חוק או
          שימושים סטטיסטיים.
        </p>

        <h2 className="text-xl font-semibold">4. עוגיות (Cookies)</h2>
        <p>האתר עושה שימוש בעוגיות לצורך תפקוד תקין וניתוח נתונים.</p>

        <h2 className="text-xl font-semibold">5. אבטחת מידע</h2>
        <p>
          אנו נוקטים באמצעים סבירים לשמירה על המידע, אך איננו יכולים להבטיח
          אבטחה מוחלטת.
        </p>

        <h2 className="text-xl font-semibold">6. יצירת קשר</h2>
        <p>
          לשאלות או בקשות בנושא פרטיות:{" "}
          <a
            href="mailto:contact@blognavon.com"
            className="text-blue-500 underline"
          >
            contact@blognavon.com
          </a>
        </p>
      </section>
    </div>
  )
}
