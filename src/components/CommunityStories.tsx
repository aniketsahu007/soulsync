import { useState } from "react";
import { Play, Users, Star } from "lucide-react";
import { Card } from "./ui/card";
import { TestimonialVideoModal, Story } from "./TestimonialVideoModal";

const stories: Story[] = [
  {
    id: "2",
    name: "Aayush",
    role: "International Student",
    title: "Community Roadmap",
    quote: "SoulSync gives you a community roadmap. It makes you feel like you aren't just a user, but a part of a movement.",
    description: "Unlike other apps that just give you a 1-800 number, SoulSync localizes support. Finding verified NGOs near campus changed my perspective on how student support should actually work.",
    thumbnail: "https://images.pexels.com/photos/7616706/pexels-photo-7616706.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/1-XMwxeRnYHYqixjKDn1MythLOMPN5_6a/preview",
    impact: "Joined Student Support Movement"
  },
  {
    id: "3",
    name: "Diya",
    role: "Senior Student",
    title: "Private by Design",
    quote: "SoulSync is different because it’s Private by Design. You just arrive, talk, and leave—zero trace.",
    description: "I used to avoid campus counseling because I didn't want a permanent 'record'. The Pathfinder Survey guided me to resources I didn't even know I needed. It’s the 'softer first step' students actually need.",
    thumbnail: "https://images.pexels.com/photos/6007184/pexels-photo-6007184.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/18kzczFuykVFrTbtc5OcJoJRkcW6bMwYO/preview",
    impact: "Pathfinder Survey Complete"
  },
  {
    id: "4",
    name: "Rudraksh",
    role: "Medical Student",
    title: "Verified Peer Match",
    quote: "My favorite thing about SoulSync is the Verified Peer Match. I got to talk to a real student volunteer who had been exactly where I was.",
    description: "Moving here for college was lonelier than I expected. Most social apps are for 'finding friends,' but sometimes you just need to be heard by someone who gets it. It's a human connection built on shared experience.",
    thumbnail: "https://images.pexels.com/photos/5888168/pexels-photo-5888168.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/1Jieawcww34QX9CD5Bpf5JjhoJvjl0ytZ/preview",
    impact: "Reclaimed Human Connection"
  }
];

export function CommunityStories() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Real Impact
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl text-foreground">
            Peers helping peers. Every single day.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            SoulSync isn't just an app—it's a community of resilient students who've been where you are. Hear how your peers reclaimed their focus and peace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
              onClick={() => setSelectedStory(story)}
            >
              <Card className="h-full overflow-hidden rounded-[2rem] border border-border bg-background shadow-none">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={story.thumbnail}
                    alt={story.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-foreground/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-foreground">
                      <Play className="h-6 w-6 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                      <Users className="h-3 w-3" /> {story.role}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-4 flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                  </div>

                  <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">
                    {story.title}
                  </h3>

                  <div className="mt-6 border-t border-border pt-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Initial Result: <span className="text-foreground">{story.impact}</span>
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground italic">
                      "{story.quote}"
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">— {story.name}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline">Read More →</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <TestimonialVideoModal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        story={selectedStory}
      />
    </section>
  );
}

