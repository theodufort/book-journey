import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from: "welcome@mybookquest.com",
          to: user == null ? "theodufort05@gmail.com" : user.email,
          subject: "Congrats on adding your first book!",
          react: FirstBookTemplate(),
        });
      } catch {}