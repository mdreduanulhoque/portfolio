import * as React from "react";
import { Youtube, PlayCircle } from "lucide-react";
import Image from "next/image";

export function ClassesSection() {
    const classes = [
        {
            title: "Thread in Java || Question Solve || OOP",
            videoId: "uobWZ7FA6XM",
            description: "A detailed problem-solving session covering Threads in Object-Oriented Programming.",
            url: "https://youtu.be/uobWZ7FA6XM?si=87TNoOs94kpDdL2S"
        },
        {
            title: "GUI - Design Part in Java",
            videoId: "Rs6k1PNkVf4",
            description: "A comprehensive guide on designing Graphical User Interfaces (GUI) in Java.",
            url: "https://youtu.be/Rs6k1PNkVf4?si=nMWrT2wIJMuSGoRP"
        },
        {
            title: "ICS One Shot Class For Mid",
            videoId: "GWtQ2FKl6ks",
            description: "A complete one-shot review class designed to prepare students for the Introduction to Computer Systems (ICS) midterm.",
            url: "https://youtu.be/GWtQ2FKl6ks?si=scAGxTYf92YBeWY-"
        }
    ];

    return (
        <section id="classes" className="py-24 bg-muted/30 relative border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-mono cursor-default">
                        ~/teaching/classes
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-lora sm:text-5xl">Online Classes</h2>
                    <p className="text-muted-foreground text-center max-w-2xl mt-4">
                        Sharing my knowledge with the community. Here are some of my publicly available classes discussing core computer science concepts.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {classes.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex flex-col bg-background/50 rounded-2xl border border-border/50 overflow-hidden hover:border-[#FF0000]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                <Image
                                    src={`https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-lg">
                                        <PlayCircle className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <h3 className="font-bold text-foreground font-lora text-xl leading-tight group-hover:text-[#FF0000] transition-colors">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex items-center text-sm font-medium text-[#FF0000]">
                                    <Youtube className="w-4 h-4 mr-2" />
                                    Watch on YouTube
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
