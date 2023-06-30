const { google } = require("googleapis");

class SequenceController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async startSequence(req, res) {
    const user = req.user;
    const gmail = await user.getGmailClient();
    await this.sendRepliesToNewThreads(gmail);

    res.send("Sequence started!");
  }

  async sendRepliesToNewThreads(gmail) {
    // Get threads from the user's inbox
    const response = await gmail.users.threads.list({ userId: "me" });
    const threads = response.data.threads;

    // Iterate through each thread
    for (const thread of threads) {
      const threadId = thread.id;

      // Get the messages within the thread
      const messagesResponse = await gmail.users.threads.get({
        userId: "me",
        id: threadId,
      });
      const messages = messagesResponse.data.messages;

      // Check if the thread has any prior emails sent by you
      const isRepliedByYou = messages.some((message) => {
        const headers = message.payload.headers;
        const fromHeader = headers.find((header) => header.name === "From");
        return fromHeader.value === "akbhojpur261998@gmail.com";
      });

      // If no prior emails sent by you, reply to the thread
      if (!isRepliedByYou) {
        // Compose the reply message
        const replyMessage = "Your reply message here.";

        // Get the last message in the thread to determine the recipient
        const lastMessage = messages[messages.length - 1];
        const lastMessageId = lastMessage.id;
        const lastMessageHeaders = lastMessage.payload.headers;
        const toHeader = lastMessageHeaders.find(
          (header) => header.name === "To"
        );
        const recipientEmail = toHeader.value;

        // Send the reply email
        await this.sendEmail(
          gmail,
          recipientEmail,
          "Re: Thread Reply",
          replyMessage
        );

        // Mark the thread as read
        await gmail.users.threads.modify({
          userId: "me",
          id: threadId,
          resource: { removeLabelIds: ["UNREAD"] },
        });

        // Add a label to the email and move it to the labeled category
        const labelName = "ankitsingh10026@gmail.com";

        // Get the label
        let label = await this.getLabel(gmail, labelName);

        // If the label doesn't exist, create it
        if (!label) {
          label = await this.createLabel(gmail, labelName);
        }

        // Apply the label to the email
        await gmail.users.messages.modify({
          userId: "me",
          id: lastMessageId,
          resource: { addLabelIds: [label.id] },
        });
      }
    }
  }

  async sendEmail(gmail, to, subject, message) {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString(
      "base64"
    )}?=`;

    const emailLines = [];
    emailLines.push(`From: Your Name <YOUR_EMAIL_ADDRESS>`);
    emailLines.push(`To: ${to}`);
    emailLines.push(`Content-Type: text/html; charset=utf-8`);
    emailLines.push(`MIME-Version: 1.0`);
    emailLines.push(`Subject: ${utf8Subject}`);
    emailLines.push(``);
    emailLines.push(`${message}`);

    const email = emailLines.join("\r\n");

    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    try {
      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
        },
      });

      console.log("Email sent:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async getLabel(gmail, labelName) {
    try {
      const response = await gmail.users.labels.list({
        userId: "me",
      });

      const labels = response.data.labels;
      const label = labels.find((label) => label.name === labelName);

      if (label) {
        console.log("Label found:", label);
        return label;
      } else {
        console.log("Label not found");
        return null;
      }
    } catch (error) {
      console.error("Error retrieving label:", error);
      throw error;
    }
  }

  async createLabel(gmail, labelName) {
    // Create label implementation using Gmail API
    const labelObject = await gmail.users.labels.create({
      userId: "me",
      resource: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });

    if (labelObject && labelObject.data && labelObject.data.id) {
      return labelObject.data;
    } else {
      throw new Error("Label creation failed.");
    }
  }
}

module.exports = SequenceController;
