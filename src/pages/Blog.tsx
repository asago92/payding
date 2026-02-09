import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogPosts";
import { format, parseISO } from "date-fns";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="py-24">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog</h1>
              <p className="text-lg text-muted-foreground mb-12">
                Tips and insights for global earners to maximize their income.
              </p>

              <div className="space-y-8">
                {blogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <article className="bg-card border border-border rounded-xl p-6 sm:p-8 transition-all duration-200 hover:shadow-soft hover:border-primary/20">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(post.date), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read more
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
