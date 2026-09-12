import { LandingHeader } from '../../components/layout/LandingHeader'
import styles from './AboutPage.module.css'

type TeamMember = {
  name: string
  image: string
  imageClassName?: string
  role: string
  bio: string
  linkedin?: string
  github?: string
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.16c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3z" />
    </svg>
  )
}

const teamMembers: TeamMember[] = [
  {
    name: 'Vamsi',
    image: '/team/vamsi.jpg',
    role: 'Machine Learning Engineer + Fullstack Developer',
    bio: 'Cleaned data, fine-tuned an ensemble model from 86.75% to 100% test accuracy, connected it to FastAPI backend, updated React UI, added Supabase authentication, and deployed application through Railway, Hugging Face, and Vercel.',
    linkedin: 'https://www.linkedin.com/in/vamsi-chitturi/',
    github: 'https://github.com/vamsi-1111',
  },
  {
    name: 'Cephas',
    image: '/team/cephas.jpeg',
    role: 'Frontend Developer',
    bio: 'Built the project’s frontend user interface with React, creating responsive pages, reusable components, and a clean, intuitive user experience.',
    linkedin: 'https://www.linkedin.com/in/cephas-osei-bonsu-911731326/',
    github: 'https://github.com/CephasTechOrg',
  },
  {
    name: 'Allen Ramirez',
    image: '/team/allen.jpg',
    imageClassName: styles.allenPhoto,
    role: 'Backend Developer',
    bio: 'Integrated FastAPI backend and supported user inputs to model endpoints. Assisted with model design along the team\'s ML engineer.',
    linkedin: 'https://www.linkedin.com/in/allenram/',
    github: 'https://github.com/drizzyallen',
  },
  {
    name: 'Amina',
    image: '/team/amina.jpg',
    role: 'Machine Learning Engineer',
    bio: 'Developed and evaluated an ensemble of 4 CNN models, implemented Grad-CAM explainability, trained and fine-tuned models.',
    linkedin: 'https://www.linkedin.com/in/amina-kudaibergen-689687226/',
    github: 'https://github.com/laximillion',
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
                {member.linkedin || member.github ? (
                  <div className={styles.links}>
                    {member.linkedin ? (
                      <a
                        className={styles.link}
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkedInIcon />
                        LinkedIn
                      </a>
                    ) : null}
                    {member.github ? (
                      <a
                        className={styles.link}
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <GitHubIcon />
                        GitHub
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
