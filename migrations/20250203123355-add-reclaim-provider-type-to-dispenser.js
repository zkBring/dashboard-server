/* eslint-disable */

module.exports = {
  async up(db) {
    let dispensersWithReclaimProviderType = 0
    let dispensersWithoutReclaimProviderType = 0
    const dispensers = await db.collection('dispensers').find({}).toArray()
    const dispensersCounter = dispensers.length

    await Promise.all(dispensers.map(async (dispenser) => {
      if (dispenser.hasOwnProperty('reclaimProviderType')) {
        console.log(`dispensersWithReclaimProviderType # -- ${dispensersWithReclaimProviderType++}`)
        return
      }

      await db.collection('dispensers').updateOne({ _id: dispenser._id }, {
        $set: {
          reclaimProviderType: 'instagram'
        }
      })
      console.log(`dispensersWithoutReclaimProviderType # -- ${dispensersWithoutReclaimProviderType++}`)
    }))

    console.log({ dispensersCounter }, { dispensersWithReclaimProviderType }, { dispensersWithoutReclaimProviderType })
  }
}
