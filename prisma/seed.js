const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const loremIpsum = require("lorem-ipsum").loremIpsum;

async function main() {
  // Function to generate random numbers between min and max
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Array to store created users
  const users = [];

  // Seed 10 Users
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        outsideId: `ext-user${i}`,
        username: `user${i}`,
        phoneNumber: `123456789${i}`,
        hotScore: randomInt(1, 10),
        karmaScore: randomInt(1, 10),
      },
    });
    users.push(user);
  }

  // For each user, create a chat with 2 other users and seed messages
  for (let i = 0; i < users.length; i++) {
    const user1 = users[i];

    // Select 2 other users randomly for the conversation
    let availableUsers = users.filter((user) => user.id !== user1.id);
    let randomUsers = [];

    while (randomUsers.length < 2) {
      const randomIndex = randomInt(0, availableUsers.length - 1);
      const selectedUser = availableUsers[randomIndex];
      randomUsers.push(selectedUser);
      availableUsers = availableUsers.filter(
        (user) => user.id !== selectedUser.id
      ); // Remove selected user from pool
    }

    const [user2, user3] = randomUsers;

    // Create chats and messages between user1 and user2
    await prisma.chat.create({
      data: {
        user1Id: user1.id,
        user2Id: user2.id,
        messages: {
          create: [
            {
              senderId: user1.id,
              content: loremIpsum({ count: 5, units: "words" }), // Generate Lorem Ipsum message for user1
            },
            {
              senderId: user2.id,
              content: loremIpsum({ count: 7, units: "words" }), // Generate Lorem Ipsum message for user2
            },
          ],
        },
      },
    });

    // Create chats and messages between user1 and user3
    await prisma.chat.create({
      data: {
        user1Id: user1.id,
        user2Id: user3.id,
        messages: {
          create: [
            {
              senderId: user1.id,
              content: loremIpsum({ count: 8, units: "words" }), // Generate Lorem Ipsum message for user1
            },
            {
              senderId: user3.id,
              content: loremIpsum({ count: 6, units: "words" }), // Generate Lorem Ipsum message for user3
            },
          ],
        },
      },
    });
  }

  console.log("Seed data has been created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
