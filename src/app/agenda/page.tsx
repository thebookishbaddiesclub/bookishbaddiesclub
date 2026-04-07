import FadeIn from "@/components/FadeIn";

export default function AgendaPage() {
  return (
    <div className="py-10 max-w-5xl mx-auto min-h-[70vh]">
      <FadeIn className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-bb-ink mb-6 italic">On se retrouve quand ?</h1>
        <p className="text-bb-ink/60 text-lg max-w-2xl mx-auto font-medium">
          Retrouvez ici toutes nos prochaines lectures communes, ateliers créatifs et événements exclusifs.
        </p>
        <div className="h-[1px] w-20 bg-bb-gold/40 mx-auto mt-10"></div>
      </FadeIn>

      <FadeIn delay={0.2} className="flex justify-center bg-white/40 backdrop-blur-md p-4 md:p-10 rounded-[3rem] border border-bb-beige shadow-xl">
        <div className="w-full aspect-[4/3] md:aspect-video relative overflow-hidden rounded-[2rem]">
          <iframe 
            src="https://calendar.google.com/calendar/embed?src=0f3559efeb4d34ff61773017db9714bc1db0b7efaf6fa649ba6dcc60e31570e9%40group.calendar.google.com&ctz=Europe%2FParis" 
            style={{ border: 0 }} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no"
            className="absolute inset-0"
          ></iframe>
        </div>
      </FadeIn>

      <FadeIn delay={0.4} className="mt-16 text-center text-bb-ink/40 text-xs uppercase tracking-widest font-black">
        📍 PERPIGNAN & MONTPELLIER
      </FadeIn>
    </div>
  );
}
