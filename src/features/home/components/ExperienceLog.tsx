import { CompanyLink } from "@/features/experience/components/CompanyLink";
import { HomeSection } from "@/features/home/components/HomeSection";
import { workExperiences } from "@/features/experience/timeline";

export function ExperienceLog() {
  return (
    <HomeSection cmd="git log --oneline ~/experience" more="/experience">
      <div className="mono flex flex-col gap-2.5 text-[14px] stagger">
        {workExperiences.map((job, i) => (
          <div key={job.company} className="grid grid-cols-[1fr_auto] gap-4 md:grid-cols-[120px_1fr_auto]">
            <CompanyLink item={job} className={`self-start ${i === 0 ? "text-accent" : "text-accent/[0.7]"}`} />
            <span className="hidden text-fg-2 md:inline">{job.role}</span>
            <span className="text-fg-3">{job.date}</span>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
