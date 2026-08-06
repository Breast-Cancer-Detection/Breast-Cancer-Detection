import { LandingHeader } from '../../components/layout/LandingHeader'
import styles from './AboutPage.module.css'

const teamMembers = [
  {
    name: 'Name Placeholder',
    role: 'Project Lead',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae velit non augue facilisis pulvinar.',
  },
  {
    name: 'Name Placeholder',
    role: 'Frontend Developer',
    bio: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
  },
  {
    name: 'Allen Ramirez',
    role: 'Backend Developer',
    bio: 'Integrated FastAPI backend and supported user inputs to model endpoints. Assisted with model design along the team\'s ML engineer.',
  },
  {
    name: 'Name Placeholder',
    role: 'Machine Learning Engineer',
    bio: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
  },
]

export function AboutPage() {
  return (
    <>
      <LandingHeader />
      <main id="main-content" className={styles.root}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.eyebrow}>THE TEAM</div>
          <h1 id="about-title">Meet the Team</h1>
        </section>

        <section className={styles.grid} aria-label="Project team">
          {teamMembers.map((member) => (
            <article key={`${member.role}-${member.name}`} className={styles.member}>
              <div className={styles.copy}>
                <div className={styles.name}>{member.name}</div>
                <div className={styles.role}>{member.role}</div>
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
