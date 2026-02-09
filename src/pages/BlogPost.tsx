import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, BlogSection } from "@/data/blogPosts";
import { format, parseISO } from "date-fns";
import useSeo from "@/hooks/use-seo";

const renderInlineLinks = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isExternal = match[2].startsWith("http");
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const renderSection = (section: BlogSection, index: number) => {
  switch (section.type) {
    case "heading":
      return (
        <h2
          key={index}
          className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-foreground"
        >
          {section.text}
        </h2>
      );
    case "subheading":
      return (
        <h3
          key={index}
          className="text-lg font-semibold mt-6 mb-3 text-foreground"
        >
          {section.text}
        </h3>
      );
    case "paragraph":
      return (
        <p
          key={index}
          className="text-muted-foreground leading-relaxed mb-4"
        >
          {renderInlineLinks(section.text!)}
        </p>
      );
    case "quote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-primary pl-5 py-2 my-6 bg-primary/5 rounded-r-lg pr-5"
        >
          <p className="text-foreground italic leading-relaxed">
            {renderInlineLinks(section.text!)}
          </p>
        </blockquote>
      );
    case "list":
      return (
        <ul key={index} className="space-y-3 my-4">
          {section.items?.map((item, i) => {
            const colonIndex = item.indexOf(":");
            const hasLabel = colonIndex > 0 && colonIndex < 40;
            return (
              <li
                key={i}
                className="flex gap-3 text-muted-foreground leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <span>
                  {hasLabel ? (
                    <>
                      <strong className="text-foreground">
                        {item.slice(0, colonIndex)}:
                      </strong>
                      {renderInlineLinks(item.slice(colonIndex + 1))}
                    </>
                  ) : (
                    renderInlineLinks(item)
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    default:
      return null;
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useSeo({
    title: post?.title ?? "Post not found",
    description: post?.excerpt ?? "This blog post could not be found.",
    path: `/blog/${slug}`,
    type: "article",
    publishedDate: post?.date,
  });

  // Inject JSON-LD for article structured data
  useEffect(() => {
    if (!post) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { "@type": "Organization", name: "Payding" },
      publisher: { "@type": "Organization", name: "Payding" },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container px-4 py-24 text-center">
            <h1 className="text-3xl font-bold mb-4">Post not found</h1>
            <Link to="/blog" className="text-primary hover:underline">
              ← Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <article className="py-16 sm:py-24">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to blog
              </Link>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(parseISO(post.date), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 text-foreground">
                {post.title}
              </h1>

              <div className="border-t border-border pt-8">
                {post.content.map((section, index) =>
                  renderSection(section, index)
                )}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
