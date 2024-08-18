import { Layout } from "@/Layout";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  return (
    <Layout>
      <PersonalIntro />
    </Layout>
  );
}

export function PersonalIntro() {
  const portfolio = useQuery(api.portfolio.list);
  const voteCool = useMutation(api.portfolio.voteCool);
  return (
    <div className="flex items-start justify-between border-b py-4">
      <div className="container flex flex-col gap-2">
        <HeaderLine>
          Background
        </HeaderLine>
        <DetailLine>
          Yale Math BA, Computer Science BS/MS 2018.
        </DetailLine>
        <DetailLine>
          Made iOS apps in High School and College.
        </DetailLine>
        <DetailLine>
          Scribe at Cape Code Hospital.
        </DetailLine>
        <DetailLine>
          Internships at Google and Dropbox.
        </DetailLine>
        <DetailLine>
          Full-time software engineer at Dropbox for 4 years.
        </DetailLine>
        <DetailLine>
          Currently at Convex for 2 years.
        </DetailLine>

        <HeaderLine>
          Portfolio
        </HeaderLine>
        {
          portfolio?.map((item) => (
            <DetailLine key={item._id}>
              <DetailLink href={item.link}>{item.linkText}</DetailLink>: {item.text}
              <button className="border-2 border-gray-500 mx-2 p-1 rounded-lg" onClick={() => voteCool({ id: item._id })}>
                cool&nbsp;
                {item.cool ? `(${item.cool})` : ""}
              </button>
            </DetailLine>
          ))
        }

        <HeaderLine>
          Interests
        </HeaderLine>
        <DetailLine>
          Bouldering
        </DetailLine>
        <DetailLine>
          Kolmogorov Complexity
        </DetailLine>
        <DetailLine>
          Distributed Systems
        </DetailLine>
        <DetailLine>
          Fiction: Worm, HPMOR, Project Hail Mary
        </DetailLine>
      </div>
    </div>
  );
}

function HeaderLine({ children }: { children: React.ReactNode }) {
  return <h1 className=" text-lg font-semibold md:text-2xl">{children}</h1>;
}

function DetailLine({ children }: { children: React.ReactNode }) {
  return <p className="hidden sm:block text-sm text-muted-foreground">{children}</p>;
}

function DetailLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="underline underline-offset-4 hover:no-underline"
      target="_blank"
    >
      {children}
    </a>
  );
}