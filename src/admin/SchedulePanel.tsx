import { DateTimePicker, Field } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';

const ARTICLE_UID = 'api::article.article';
const FIELD = 'scheduled_publish_at';

function ScheduleInput() {
  const field = useField<string | Date | null>(FIELD);
  const value = typeof field.value === 'string' ? new Date(field.value) : field.value;

  return (
    <Field.Root
      name={FIELD}
      error={field.error}
      hint="Press Save, not Publish. The article goes live at this time (your local time)."
      width="100%"
    >
      <Field.Label>Publish date and time</Field.Label>
      <DateTimePicker
        clearLabel="Clear"
        minDate={new Date()}
        value={value}
        onChange={(date) => field.onChange(FIELD, date ? date.toISOString() : null)}
        onClear={() => field.onChange(FIELD, null)}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
}

/** Side panel under the Publish / Save buttons on the article edit page. */
export function SchedulePanel({ model }: { model: string }) {
  if (model !== ARTICLE_UID) return null;
  return { title: 'Schedule', content: <ScheduleInput /> };
}
