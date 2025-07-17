const users = {
  1: { id: 1, name: 'Alice', age: 25 },
  2: { id: 2, name: 'Bob', age: 30 }
};

async function getUserFromDB(userId) {
  console.log(' Fetching from fake database...');
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  return users[userId] || null;
}

module.exports = { getUserFromDB };
