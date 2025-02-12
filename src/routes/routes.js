const routes = {
  '/dashboard/linkdrop/campaigns/:campaign_id': {
    get: {
      controller: 'campaign-controller',
      method: 'getCampaignById',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    },
    patch: {
      controller: 'campaign-controller',
      method: 'updateCampaign',
      authType: ['JWT',],
      celebrateSchema: 'updateCampaign'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/save-batch': {
    post: {
      controller: 'campaign-controller',
      method: 'addLinksBatch',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'addLinksBatch'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksBatches',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches/:batch_id': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksBatchById',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'getLinksBatchById'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/batches/:batch_id/add-links': {
    post: {
      controller: 'campaign-controller',
      method: 'addLinksToBatch',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'addLinksToBatch'
    }
  },
  '/dashboard/linkdrop/campaigns/:campaign_id/report': {
    get: {
      controller: 'campaign-controller',
      method: 'getLinksReport',
      authType: ['JWT', 'CAMPAIGN_SIG'],
      celebrateSchema: 'checkCampaignId'
    }
  },
  '/dashboard/linkdrop/campaigns': {
    post: {
      controller: 'campaign-controller',
      method: 'createCampaign',
      authType: ['JWT',],
      celebrateSchema: 'createCampaign'

    },
    get: {
      controller: 'campaign-controller',
      method: 'getCampaigns',
      authType: ['JWT',],
      celebrateSchema: 'getCampaigns'
    }
  },
  '/dashboard/linkdrop/claim-links/:link_id/deactivate': {
    post: {
      controller: 'claim-link-controller',
      method: 'deactivateClaimLink',
      authType: ['CAMPAIGN_SIG',],
      celebrateSchema: 'checkLinkId'
    }
  },
  '/dashboard/linkdrop/claim-links/:link_id/reactivate': {
    post: {
      controller: 'claim-link-controller',
      method: 'reactivateClaimLink',
      authType: ['CAMPAIGN_SIG',],
      celebrateSchema: 'checkLinkId'
    }
  },
  '/dashboard/dispensers': {
    get: {
      controller: 'dispenser-controller',
      method: 'getDispensers',
      authType: ['JWT',]
    },
    post: {
      controller: 'dispenser-controller',
      method: 'createDispenser',
      authType: ['JWT',],
      celebrateSchema: 'createDispenser'
    }
  },
  '/dashboard/dispensers/:dispenser_id': {
    get: {
      controller: 'dispenser-controller',
      method: 'getDispenserById',
      authType: ['JWT',]
    },
    patch: {
      controller: 'dispenser-controller',
      method: 'updateDispenser',
      authType: ['JWT',],
      celebrateSchema: 'updateDispenser'
    }
  },
  '/dashboard/dispensers/:dispenser_id/update-status': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateDispenserStatus',
      authType: ['JWT',],
      celebrateSchema: 'updateDispenserStatus'
    }
  },
  '/dashboard/dispensers/:dispenser_id/redirect-link': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateRedirectUrl',
      authType: ['JWT',],
      celebrateSchema: 'updateRedirectUrl'
    }
  },
  '/dashboard/dispensers/:dispenser_id/redirect-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateRedirectOn',
      authType: ['JWT',],
      celebrateSchema: 'updateRedirectOn'
    }
  },
  '/dashboard/dispensers/:dispenser_id/upload-links': {
    post: {
      controller: 'dispenser-controller',
      method: 'uploadLinks',
      authType: ['JWT',],
      celebrateSchema: 'uploadLinks'
    },
    put: {
      controller: 'dispenser-controller',
      method: 'updateLinks',
      authType: ['JWT',],
      celebrateSchema: 'updateLinks'
    }
  },
  '/dashboard/dispensers/:dispenser_id/report': {
    get: {
      controller: 'dispenser-controller',
      method: 'getLinksReport',
      authType: ['JWT',],
      celebrateSchema: 'getLinksReport'
    }
  },
  '/dashboard/dispensers/:dispenser_id/timeframe-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateTimeframeOn',
      authType: ['JWT',],
      celebrateSchema: 'updateTimeframeOn'
    }
  },
  '/dashboard/dispensers/:dispenser_id/whitelist-on': {
    patch: {
      controller: 'dispenser-controller',
      method: 'updateWhitelistOn',
      authType: ['JWT',],
      celebrateSchema: 'updateWhitelistOn'
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
      authType: ['JWT',],
      celebrateSchema: 'updateReclaimData'
    }
  },
  '/dashboard/dashboard-key': {
    get: {
      controller: 'dashboard-key-controller',
      method: 'getEncryptedKey',
      authType: ['JWT',]
    },
    post: {
      controller: 'dashboard-key-controller',
      method: 'addEncryptedKey',
      authType: ['JWT',],
      celebrateSchema: 'addEncryptedKey'
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
  }
}

module.exports = routes
