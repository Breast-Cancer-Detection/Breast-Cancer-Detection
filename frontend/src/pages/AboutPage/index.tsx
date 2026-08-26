import { LandingHeader } from '../../components/layout/LandingHeader'
import styles from './AboutPage.module.css'

const teamMembers = [
  {
    name: 'Vamsi',
    image: '/team/vamsi.jpg',
    role: 'Machine Learning Engineer + Fullstack Developer',
    bio: 'Cleaned data, fine-tuned a 4-model CNN ensemble from 86.75% to 100% test accuracy, integrated it into a FastAPI backend, added Supabase authentication for data protection, and deployed through Railway, Hugging Face, and Vercel.',
  },
  {
    name: 'Cephas',
    image: '/team/cephas.jpeg',
    role: 'Frontend Developer',
    bio: 'Built the project’s frontend user interface with React, creating responsive pages, reusable components, and a clean, intuitive user experience..',
  },
  {
    name: 'Allen Ramirez',
    image: '/team/allen.jpg',
    imageClassName: styles.allenPhoto,
    role: 'Backend Developer',
    bio: 'Integrated FastAPI backend and supported user inputs to model endpoints. Assisted with model design along the team\'s ML engineer.',
  },
  {
    name: 'Amina',
    image: '/team/amina.jpg',
    role: 'Machine Learning Engineer',
    bio: 'Developed and evaluated an ensemble of 4 CNN models, implemented Grad-CAM explainability, trained and fine-tuned models.',
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
            <article
              key={`${member.role}-${member.name}`}
              className={`${styles.member} ${member.image ? '' : styles.memberNoPhoto}`}
            >
              {member.image ? (
                <img
                  className={`${styles.photo} ${member.imageClassName ?? ''}`}
                  src={member.image}
                  alt={`${member.name} headshot`}
                />
              ) : null}
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
