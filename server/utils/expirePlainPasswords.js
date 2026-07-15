import PremiumUser from "../models/PremiumUser.js";

/**
 * Clears plainPasswordForAdmin on any user document where:
 *  - plainPasswordForAdmin is not null, AND
 *  - the document was created more than 24 hours ago.
 *
 * Called once on server startup and then every hour via setInterval.
 * This limits the window in which a plain-text password copy is stored.
 */
export async function expirePlainPasswords() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await PremiumUser.updateMany(
      {
        plainPasswordForAdmin: { $ne: null },
        createdAt: { $lt: cutoff },
      },
      { $set: { plainPasswordForAdmin: null } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `🔒 Expired plain passwords cleared for ${result.modifiedCount} user(s).`
      );
    }
  } catch (err) {
    console.error("expirePlainPasswords error:", err.message);
  }
}
