const routes = {
  '/dashboard/linkdrop/campaigns/:campaign_id': {
    get: {
      controller: 'campaign-controller',
      method: 'getCampaignById',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    },
    patch: {
      controller: 'campaign-controller',
      method: 'updateCampaign',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateCampaign'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/save-batch': {
    post: {
      controller: 'campaign-controller',
      method: 'addLinksBatch',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'addLinksBatch'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksBatches',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches/:batch_id': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksBatchById',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'getLinksBatchById'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches/:batch_id/add-links': {
    post: {
      controller: 'campaign-controller',
      method: 'addLinksToBatch',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'addLinksToBatch'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/report': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksReport',
      authType: ['JWT', 'API_KEY', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    }
  },
  '/dashboard/QR/sets': {
    post: {
      controller: 'set-controller',
      method: 'createQRSet',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'createQRSet'
    },
    get: {
      controller: 'set-controller',
      method: 'getQRSets',
      authType: ['JWT', 'API_KEY']
    }
  },
  '/dashboard/QR/sets/:set_id': {
    get: {
      controller: 'set-controller',
      method: 'getQRSetById',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'checkSetId'
    },
    patch: {
      controller: 'set-controller',
      method: 'updateQRSet',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateQRSet'
    }
  },
  '/dashboard/QR/sets/:set_id/QRs': {
    get: {
      controller: 'set-controller',
      method: 'getQRsBySetId',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'checkSetId'
    }
  },
  '/dashboard/QR/sets/:set_id/update-status': {
    patch: {
      controller: 'set-controller',
      method: 'updateStatus',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateStatus'
    }
  },
  '/dashboard/QR/sets/:set_id/update-quantity': {
    patch: {
      controller: 'set-controller',
      method: 'updateQuantity',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateQuantity'
    }
  },
  '/dashboard/QR/sets/:set_id/links-mapping': {
    get: {
      controller: 'set-controller',
      method: 'getMappedLinks',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'checkSetId'
    }
  },
  '/dashboard/QR/sets/:set_id/map-links': {
    patch: {
      controller: 'set-controller',
      method: 'mapLinks',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'mapLinks'
    }
  },
  '/dashboard/linkdrop/campaigns': {
    post: {
      controller: 'campaign-controller',
      method: 'createCampaign',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'createCampaign'

    },
    get: {
      controller: 'campaign-controller',
      method: 'getCampaigns',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'getCampaigns'
    }
  },
  '/dashboard/linkdrop/claim-links/:link_id/deactivate': {
    post: {
      controller: 'claim-link-controller',
      method: 'deactivateClaimLink',
      authType: ['CAMPAIGN_SIG', 'API_KEY'],
      celebrateSchema: 'checkLinkId'
    }
  },
  '/dashboard/linkdrop/claim-links/:link_id/reactivate': {
    post: {
      controller: 'claim-link-controller',
      method: 'reactivateClaimLink',
      authType: ['CAMPAIGN_SIG', 'API_KEY'],
      celebrateSchema: 'checkLinkId'
    }
  },
  '/dashboard/dispensers': {
    get: {
      controller: 'dispenser-controller',
      method: 'getDispensers',
      authType: ['JWT', 'API_KEY']
    },
    post: {
      controller: 'dispenser-controller',
      method: 'createDispenser',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'createDispenser'
    }
  },
  '/dashboard/dispensers/:dispenser_id': {
    get: {
      controller: 'dispenser-controller',
      method: 'getDispenserById',
      authType: ['JWT', 'API_KEY']
    },
    patch: {
      controller: 'dispenser-controller',
      method: 'updateDispenser',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateDispenser'
    }
  },
  '/dashboard/dispensers/:dispenser_id/update-status': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateDispenserStatus',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateDispenserStatus'
    }
  },
  '/dashboard/dispensers/:dispenser_id/redirect-link': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateRedirectUrl',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateRedirectUrl'
    }
  },
  '/dashboard/dispensers/:dispenser_id/redirect-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateRedirectOn',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateRedirectOn'
    }
  },
  '/dashboard/dispensers/:dispenser_id/upload-links': {
    post: {
      controller: 'dispenser-controller',
      method: 'uploadLinks',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'uploadLinks'
    },
    put: {
      controller: 'dispenser-controller',
      method: 'updateLinks',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateLinks'
    }
  },
  '/dashboard/dispensers/:dispenser_id/report': {
    get: {
      controller: 'dispenser-controller',
      method: 'getLinksReport',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'getLinksReport'
    }
  },
  '/dashboard/dispensers/:dispenser_id/timeframe-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateTimeframeOn',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateTimeframeOn'
    }
  },
  '/dashboard/dispensers/:dispenser_id/whitelist-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateWhitelistOn',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateWhitelistOn'
    }
  },
  '/dashboard/dispensers/:dispenser_id/whitelist': {
    get: {
      controller: 'dispenser-controller',
      method: 'getWhitelist',
      authType: ['JWT', 'API_KEY']
    },
    post: {
      controller: 'dispenser-controller',
      method: 'addWhitelist',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'addWhitelist'
    },
    put: {
      controller: 'dispenser-controller',
      method: 'addWhitelist',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateWhitelist'
    }
  },
  '/dashboard/dispensers/pop/multiscan-qrs/:multiscan_qr_id': {
    post: {
      controller: 'dispenser-controller',
      method: 'pop',
      celebrateSchema: 'pop'
    }
  },
  '/dashboard/dispensers/pop-reclaim/multiscan-qrs/:multiscan_qr_id': {
    post: {
      controller: 'dispenser-controller',
      method: 'popReclaimLink',
      celebrateSchema: 'popReclaimLink'
    }
  },
  '/dashboard/dispensers/multiscan-qrs/:multiscan_qr_id/campaign': {
    get: {
      controller: 'dispenser-controller',
      method: 'getCampaign'
    }
  },
  '/claimer/dispensers/multiscan-qrs/:multiscan_qr_id/campaign': {
    get: {
      controller: 'dispenser-controller',
      method: 'getCampaignDataForClaimer'
    }
  },
  '/dashboard/dispensers/multiscan-qrs/:multiscan_qr_id/campaign/:session_id/receive-reclaim-proofs': {
    post: {
      controller: 'dispenser-controller',
      method: 'receiveReclaimProofs'
    }
  },
  '/dashboard/dispensers/multiscan-qrs/:multiscan_qr_id/settings': {
    get: {
      controller: 'dispenser-controller',
      method: 'getDispenserSettings'
    }
  },
  '/dashboard/dispensers/:dispenser_id/reclaim': {
    put: {
      controller: 'dispenser-controller',
      method: 'updateReclaimData',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateReclaimData'
    }
  },
  '/dashboard/collections': {
    get: {
      controller: 'token-collection-controller',
      method: 'getCollections',
      authType: ['JWT', 'API_KEY']
    },
    post: {
      controller: 'token-collection-controller',
      method: 'createCollection',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'createCollection'
    }
  },
  '/dashboard/collections/:collection_id': {
    get: {
      controller: 'token-collection-controller',
      method: 'getCollectionById',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'checkCollectionId'
    },
    patch: {
      controller: 'token-collection-controller',
      method: 'updateCollection',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'updateCollection'
    }
  },
  '/dashboard/collections/:collection_id/token': {
    post: {
      controller: 'token-collection-controller',
      method: 'addTokenToCollection',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'addTokenToCollection'
    }
  },
  '/dashboard/dashboard-key': {
    get: {
      controller: 'dashboard-key-controller',
      method: 'getEncryptedKey',
      authType: ['JWT', 'API_KEY']
    },
    post: {
      controller: 'dashboard-key-controller',
      method: 'addEncryptedKey',
      authType: ['JWT', 'API_KEY'],
      celebrateSchema: 'addEncryptedKey'
    }
  },
  '/user/QR/:qr_id': {
    get: {
      controller: 'receiver-controller',
      method: 'getLink',
      celebrateSchema: 'checkQrId'
    }
  },
  '/claim-links/:link_id': {
    get: {
      controller: 'receiver-controller',
      method: 'getLinkWithClaimParams',
      celebrateSchema: 'checkLinkId'
    }
  },
  '/claim-links/:link_id/status': {
    get: {
      controller: 'claim-link-controller',
      method: 'getClaimLinkStatus',
      celebrateSchema: 'checkLinkId'
    }
  },
  '/claim-links/:link_id/claim': {
    post: {
      controller: 'claim-link-controller',
      method: 'claim',
      celebrateSchema: 'claim'
    }
  },
  '/payment-status/transfer/:transfer_id': {
    get: {
      controller: 'p2p-payment-controller',
      method: 'getPaymentStatus',
      celebrateSchema: 'getPaymentStatus'
    }
  },
  '/escrow-payments/redeem': {
    post: {
      controller: 'p2p-payment-controller',
      method: 'redeem',
      celebrateSchema: 'redeem'
    }
  },
  '/dashboard/auth': {
    post: {
      controller: 'login-controller',
      method: 'login',
      celebrateSchema: 'login'
    }
  },
  '/dashboard/logout': {
    post: {
      controller: 'login-controller',
      method: 'logout',
      authType: ['JWT']
    }
  },
  '/nonce': {
    post: {
      controller: 'login-controller',
      method: 'getNonce',
      celebrateSchema: 'getNonce'
    }
  },
  '/dashboard/qr-manager': {
    get: {
      controller: 'qr-manager-controller',
      method: 'getQrCampaigns',
      authType: ['JWT', 'API_KEY']
    }
  }
}

module.exports = routes
