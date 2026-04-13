import { Scan, Brain, BarChart3, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Scan,
    title: "Frame Extraction",
    description: "Video is broken into individual frames for detailed spatial and temporal analysis.",
  },
  {
    icon: Brain,
    title: "Deep Learning Analysis",
    description: "Our neural network scans for GAN artifacts, unnatural textures, and temporal inconsistencies.",
  },
  {
    icon: BarChart3,
    title: "YOLO-Based Detection",
    description: "YOLO-Face v8 model performs facial landmark analysis to detect deepfake manipulation.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence Scoring",
    description: "Results from multiple models are aggregated into a final confidence score and verdict.",
  },
];

const HowItWorks = () => (
  <section className="w-full max-w-4xl mx-auto mt-20 mb-12">
    <h2 className="text-2xl font-bold text-center text-foreground mb-2">How It Works</h2>
    <p className="text-center text-muted-foreground text-sm mb-10">
      Powered by deep learning and computer vision models
    </p>
    <div className="grid md:grid-cols-4 gap-4">
      {steps.map(({ icon: Icon, title, description }, i) => (
        <div
          key={title}
          className="glass-card p-6 text-center group hover:scale-[1.03] transition-transform duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
