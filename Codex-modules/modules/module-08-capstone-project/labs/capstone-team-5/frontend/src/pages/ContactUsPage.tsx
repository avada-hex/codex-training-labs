import { PageShell } from '../components/PageShell';

export function ContactUsPage() {
  return (
    <PageShell
      title="Contact Us"
      description="Send a support message or ask the care team for help."
    >
      <section className="card">
        <form className="stack">
          <label>
            <span>Category</span>
            <select defaultValue="support">
              <option value="support">Support</option>
              <option value="records">Records</option>
              <option value="care-plan">Care plan</option>
            </select>
          </label>
          <label>
            <span>Message</span>
            <textarea rows="5" placeholder="Tell us how we can help." />
          </label>
          <button type="button">Send message</button>
        </form>
      </section>
    </PageShell>
  );
}
