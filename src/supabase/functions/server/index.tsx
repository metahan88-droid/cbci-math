import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// 회원가입 API
app.post("/make-server-7e316a07/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 공지사항 API
app.get("/make-server-7e316a07/notices", async (c) => {
  try {
    const notices = await kv.get("notices");
    return c.json({ success: true, data: notices || [] });
  } catch (error) {
    console.log("Error fetching notices:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-7e316a07/notices", async (c) => {
  try {
    const body = await c.req.json();
    const notices = await kv.get("notices") || [];
    notices.push(body);
    await kv.set("notices", notices);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error creating notice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-7e316a07/notices/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const notices = await kv.get("notices") || [];
    const index = notices.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      notices[index] = { ...notices[index], ...body };
      await kv.set("notices", notices);
      return c.json({ success: true, data: notices[index] });
    }
    return c.json({ success: false, error: "Notice not found" }, 404);
  } catch (error) {
    console.log("Error updating notice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-7e316a07/notices/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const notices = await kv.get("notices") || [];
    const filtered = notices.filter((n: any) => n.id !== id);
    await kv.set("notices", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting notice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 수업자료 API
app.get("/make-server-7e316a07/lessons", async (c) => {
  try {
    const lessons = await kv.get("lessonMaterials");
    return c.json({ success: true, data: lessons || [] });
  } catch (error) {
    console.log("Error fetching lessons:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-7e316a07/lessons", async (c) => {
  try {
    const body = await c.req.json();
    const lessons = await kv.get("lessonMaterials") || [];
    lessons.push(body);
    await kv.set("lessonMaterials", lessons);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error creating lesson:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-7e316a07/lessons/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const lessons = await kv.get("lessonMaterials") || [];
    const index = lessons.findIndex((l: any) => l.id === id);
    if (index !== -1) {
      lessons[index] = { ...lessons[index], ...body };
      await kv.set("lessonMaterials", lessons);
      return c.json({ success: true, data: lessons[index] });
    }
    return c.json({ success: false, error: "Lesson not found" }, 404);
  } catch (error) {
    console.log("Error updating lesson:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-7e316a07/lessons/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const lessons = await kv.get("lessonMaterials") || [];
    const filtered = lessons.filter((l: any) => l.id !== id);
    await kv.set("lessonMaterials", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting lesson:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 탐구자료 API
app.get("/make-server-7e316a07/research", async (c) => {
  try {
    const research = await kv.get("researchMaterials");
    return c.json({ success: true, data: research || [] });
  } catch (error) {
    console.log("Error fetching research:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-7e316a07/research", async (c) => {
  try {
    const body = await c.req.json();
    const research = await kv.get("researchMaterials") || [];
    research.push(body);
    await kv.set("researchMaterials", research);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error creating research:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-7e316a07/research/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const research = await kv.get("researchMaterials") || [];
    const index = research.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      research[index] = { ...research[index], ...body };
      await kv.set("researchMaterials", research);
      return c.json({ success: true, data: research[index] });
    }
    return c.json({ success: false, error: "Research not found" }, 404);
  } catch (error) {
    console.log("Error updating research:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-7e316a07/research/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const research = await kv.get("researchMaterials") || [];
    const filtered = research.filter((r: any) => r.id !== id);
    await kv.set("researchMaterials", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting research:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 평가자료 API
app.get("/make-server-7e316a07/evaluations", async (c) => {
  try {
    const evaluations = await kv.get("evaluationMaterials");
    return c.json({ success: true, data: evaluations || [] });
  } catch (error) {
    console.log("Error fetching evaluations:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-7e316a07/evaluations", async (c) => {
  try {
    const body = await c.req.json();
    const evaluations = await kv.get("evaluationMaterials") || [];
    evaluations.push(body);
    await kv.set("evaluationMaterials", evaluations);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error creating evaluation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-7e316a07/evaluations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const evaluations = await kv.get("evaluationMaterials") || [];
    const index = evaluations.findIndex((e: any) => e.id === id);
    if (index !== -1) {
      evaluations[index] = { ...evaluations[index], ...body };
      await kv.set("evaluationMaterials", evaluations);
      return c.json({ success: true, data: evaluations[index] });
    }
    return c.json({ success: false, error: "Evaluation not found" }, 404);
  } catch (error) {
    console.log("Error updating evaluation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-7e316a07/evaluations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const evaluations = await kv.get("evaluationMaterials") || [];
    const filtered = evaluations.filter((e: any) => e.id !== id);
    await kv.set("evaluationMaterials", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting evaluation:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// CBCI 자료 API
app.get("/make-server-7e316a07/cbci", async (c) => {
  try {
    const cbci = await kv.get("cbciMaterials");
    return c.json({ success: true, data: cbci || [] });
  } catch (error) {
    console.log("Error fetching cbci:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-7e316a07/cbci", async (c) => {
  try {
    const body = await c.req.json();
    const cbci = await kv.get("cbciMaterials") || [];
    cbci.push(body);
    await kv.set("cbciMaterials", cbci);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error creating cbci:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-7e316a07/cbci/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const cbci = await kv.get("cbciMaterials") || [];
    const index = cbci.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      cbci[index] = { ...cbci[index], ...body };
      await kv.set("cbciMaterials", cbci);
      return c.json({ success: true, data: cbci[index] });
    }
    return c.json({ success: false, error: "CBCI not found" }, 404);
  } catch (error) {
    console.log("Error updating cbci:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-7e316a07/cbci/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cbci = await kv.get("cbciMaterials") || [];
    const filtered = cbci.filter((c: any) => c.id !== id);
    await kv.set("cbciMaterials", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting cbci:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
