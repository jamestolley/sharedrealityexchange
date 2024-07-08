import { gql } from "@apollo/client";

//for viewing a single Campaign
export const GQL_CAMPAIGN_by_campaignId = () => {
  return gql`
    query ($campaignId: Int!) {
      campaigns(where: { campaignId: $campaignId }) {
        id
        campaignId
        owner
        title
        claim
        description
        amountCollected
        amountWithdrawn
      }
      follows(where: { campaign_: { campaignId: $campaignId } }) {
        user
        createdAt
      }
    }
  `;
};

//for the Campaigns list page
//returns the most recent first
export const GQL_CAMPAIGNS_list = () => {
  return gql`
    query ($limit: Int!, $offset: Int!) {
      campaigns(orderBy: campaignId, orderDirection: desc, first: $limit, skip: $offset) {
        id
        campaignId
        owner
        title
        claim
        description
        amountCollected
        amountWithdrawn
      }
      follows {
        user
        createdAt
      }
    }
  `;
};

// fetch the Campaign's "Social Media Page" list-of-posts on "/campaigns/{campaignId}"
// returns latest-first
export const GQL_SOCIAL_POSTS_for_display = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $campaignId: Int!, $userWalletAddress: String) {
      socialPosts(
        where: { campaignId: $campaignId }
        orderBy: socialProposalId
        orderDirection: desc
        first: $limit
        skip: $offset
      ) {
        id
        postText
        proposedBy
        campaignId
        campaignTitle
        likeCount
        likes(where: { userWhoLiked: $userWalletAddress }) {
          id
        }
      }
    }
  `;
};

// fetch latest posts
// used on Explore page
export const GQL_EXPLORE_POSTS_for_display = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $userWalletAddress: String) {
      socialPosts(orderBy: blockTimestamp, orderDirection: desc, first: $limit, skip: $offset) {
        id
        postText
        proposedBy
        campaignId
        campaignTitle
        likeCount
        likes(where: { userWhoLiked: $userWalletAddress }) {
          id
        }
      }
    }
  `;
};

// for viewing latest posts, from who the user is following
// used on Explore page
export const GQL_EXPLORE_POSTS_by_who_you_follow = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $user: String) {
      follows(orderBy: blockTimestamp, orderDirection: desc, first: $limit, skip: $offset, where: { user: $user }) {
        id
        campaign {
          id
          posts {
            id
            postText
            proposedBy
            campaignId
            campaignTitle
            likeCount
            likes(where: { userWhoLiked: $user }) {
              id
            }
          }
        }
      }
    }
  `;
};

// fetch a single Social Media Post
// used in /post/[postId].tsx
export const GQL_SOCIAL_POST_for_display = () => {
  return gql`
    query ($socialPostId: String!, $userWalletAddress: String) {
      socialPost(id: $socialPostId) {
        id
        postText
        proposedBy
        campaignId
        campaignTitle
        likeCount
        likes(where: { userWhoLiked: $userWalletAddress }) {
          id
        }
      }
    }
  `;
};

// for viewing a Post's Comments
// used in /post/[postId].tsx -- Comments.tsx
export const GQL_SOCIAL_POST_COMMENTS_for_display = () => {
  return gql`
    query ($socialPostId: String!, $userWalletAddress: String) {
      comments(
        orderBy: numericalId
        orderDirection: desc
        where: { parentCommentId: "0x", socialPost_: { id: $socialPostId } }
      ) {
        id
        commentText
        commenter
        likeCount
        likes(where: { userWhoLiked: $userWalletAddress }) {
          id
        }
        subcomments(orderBy: numericalId, orderDirection: desc) {
          id
          parentCommentId
          commentText
          commenter
          likeCount
          likes(where: { userWhoLiked: $userWalletAddress }) {
            id
          }
        }
      }
    }
  `;
};

// for viewing a Post's Sub-Sub-Comments
// used in /post/[postId].tsx -- SubSubComments.tsx
export const GQL_SOCIAL_SUB_COMMENTS_for_display = () => {
  return gql`
    query ($parentCommentId: String!, $userWalletAddress: String) {
      comments(orderBy: numericalId, orderDirection: desc, where: { parentCommentId: $parentCommentId }) {
        id
        parentCommentId
        commentText
        commenter
        likeCount
        likes(where: { userWhoLiked: $userWalletAddress }) {
          id
        }
        subcomments(orderBy: numericalId, orderDirection: desc) {
          id
          parentCommentId
          commentText
          commenter
          likeCount
          likes(where: { userWhoLiked: $userWalletAddress }) {
            id
          }
        }
      }
    }
  `;
};

// fetch all Campaign
// queries page
// for viewing 3-tier table
export const GQL_CAMPAIGNS_three_tier = () => {
  return gql`
    query ($limit: Int!, $offset: Int!) {
      campaigns(orderBy: campaignId, orderDirection: desc, first: $limit, skip: $offset) {
        id
        campaignId
        owner
        title
        description
        amountCollected
        amountWithdrawn
        proposals {
          id
          proposalId
          campaignId
          proposedBy
          amount
          to
          reason
          status
          signatures {
            id
            signer
            signature
          }
        }
      }
    }
  `;
};

//for Finalization of a Proposal
//returns all signatures for a Proposal (which are then sent to the contract)
export const GQL_SIGNATURES = () => {
  return gql`
    query ($slug1: Int!, $slug2: Int!) {
      proposals(where: { campaignId: $slug1, proposalId: $slug2 }) {
        signatures {
          signature
        }
      }
    }
  `;
};

// for Finalization of a Social Media Post
// returns all signatures for a proposed Post (which are then sent to the contract)
export const GQL_SOCIAL_SIGNATURES = () => {
  return gql`
    query ($slug1: Int!, $slug2: Int!) {
      socialProposals(where: { campaignId: $slug1, socialProposalId: $slug2 }) {
        signatures {
          signature
        }
      }
    }
  `;
};

// will not return revoked proposals
// for the table on the vaults page
export const GQL_PROPOSALS_by_campaignId = () => {
  return gql`
    query ($slug: Int!) {
      proposals(where: { campaignId: $slug, status_lt: 3 }) {
        id
        proposalId
        campaignId
        proposedBy
        amount
        to
        reason
        status
        signatures {
          id
          signer
          signature
        }
      }
    }
  `;
};

// fetch snapshot of latest proposals
// queries page
// LATEST PROPOSALS
export const GQL_PROPOSALS_snapshot = (searchInput: string) => {
  if (searchInput.trim().length === 0)
    return gql`
      query ($limit: Int!, $offset: Int!) {
        proposals(orderBy: proposalId, orderDirection: desc, first: $limit, skip: $offset) {
          id
          proposedBy
          amount
          to
          reason
          status
          campaign {
            id
            title
            amountCollected
            amountWithdrawn
          }
        }
      }
    `;
  else
    return gql`
      query ($limit: Int!, $offset: Int!, $searchBy: String) {
        proposals(
          where: { or: [{ proposedBy_contains: $searchBy }, { to_contains: $searchBy }] }
          orderBy: proposalId
          orderDirection: desc
          first: $limit
          skip: $offset
        ) {
          id
          proposedBy
          amount
          to
          reason
          status
          campaign {
            id
            title
            amountCollected
            amountWithdrawn
          }
        }
      }
    `;
};

// fetch snapshot of latest signers
// queries page
// LATEST SIGNERS
export const GQL_SIGNERS_snapshot = (searchInput: string) => {
  if (searchInput.trim().length === 0)
    return gql`
      query ($limit: Int!, $offset: Int!) {
        proposalSignatures(orderBy: proposalId, orderDirection: desc, first: $limit, skip: $offset) {
          id
          proposalId
          signer
          proposal {
            id
            amount
            to
            reason
          }
        }
      }
    `;
  else
    return gql`
      query ($limit: Int!, $offset: Int!, $searchBy: String) {
        proposalSignatures(
          where: { or: [{ signer_contains: $searchBy }, { proposal_: { to_contains: $searchBy } }] }
          orderBy: proposalId
          orderDirection: desc
          first: $limit
          skip: $offset
        ) {
          id
          proposalId
          signer
          proposal {
            id
            amount
            to
            reason
          }
        }
      }
    `;
};

// fetch donations for a campaign
// queries page
export const GQL_DONATIONS_by_campaignid = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $campaignid: String) {
      donations(
        where: { campaign: $campaignid }
        orderBy: createdAt
        orderDirection: desc
        first: $limit
        skip: $offset
      ) {
        id
        donor {
          id
        }
        amount
        campaign {
          id
          campaignId
          title
        }
        createdAt
      }
    }
  `;
};

// fetch donations for a campaign
// queries page
export const GQL_WITHDRAWALS_by_campaignid = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $campaignid: String) {
      withdrawals(
        where: { campaign: $campaignid }
        orderBy: createdAt
        orderDirection: desc
        first: $limit
        skip: $offset
      ) {
        id
        withdrawer {
          id
        }
        amount
        campaign {
          id
          campaignId
          title
        }
        createdAt
      }
    }
  `;
};

// fetch donations for a campaign
// queries page
export const GQL_FOLLOWS_by_campaignid = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $campaignid: String) {
      follows(
        where: { campaign: $campaignid }
        orderBy: createdAt
        orderDirection: desc
        first: $limit
        skip: $offset
      ) {
        id
        user {
          id
        }
        campaign {
          id
          campaignId
          title
        }
        createdAt
      }
    }
  `;
};

// fetch donations for a campaign
// queries page
export const GQL_DONATIONS = (searchInput: string) => {
  if (searchInput.trim().length === 0)
    return gql`
      query ($limit: Int!, $offset: Int!) {
        donations(orderBy: campaignId, orderDirection: desc, first: $limit, skip: $offset) {
          id
          donor
          amount
          campaign {
            id
            campaignId
            title
          }
        }
      }
    `;
  else
    return gql`
      query ($limit: Int!, $offset: Int!, $searchBy: String) {
        donations(
          where: { campaign_: { title_contains_nocase: $searchBy } }
          orderBy: campaignId
          orderDirection: desc
          first: $limit
          skip: $offset
        ) {
          id
          donor
          amount
          campaign {
            id
            campaignId
            title
          }
        }
      }
    `;
};

// fetch SOCIAL Proposals data for a Campaign
// will not return revoked proposals
export const GQL_SOCIAL_PROPOSALS_by_campaignId = () => {
  return gql`
    query ($slug: Int!) {
      socialProposals(where: { campaignId: $slug, status_lt: 3 }) {
        id
        socialProposalId
        campaignId
        proposedBy
        postText
        status
        signatures {
          id
          signer
          signature
        }
      }
    }
  `;
};

// fetch whether or not a user is following a Campaign
// used in FollowToggle.tsx
export const GQL_SOCIAL_FOLLOWERS_by_campaignId_and_address = () => {
  return gql`
    query ($campaignId: Int!, $user: String!) {
      campaigns(where: { campaignId: $campaignId }) {
        follows(where: { user: $user }) {
          campaign {
            title
          }
          user
        }
      }
    }
  `;
};

// fetch the Campaigns that a user is following
// used in WhoAmIFollowing.tsx
export const GQL_SOCIAL_FOLLOWING_by_address = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $user: String!) {
      follows(
        orderBy: campaignId
        orderDirection: desc
        first: $limit
        skip: $offset
        where: { user: $user, campaign_not: null }
      ) {
        id
        campaign {
          id
          campaignId
          title
          description
          amountCollected
          amountWithdrawn
        }
      }
    }
  `;
};

// fetch the followers for a particular Campaign
// used in WhoFollowsThisCampaign.tsx
export const GQL_SOCIAL_FOLLOWERS_by_campaignId = () => {
  return gql`
    query ($limit: Int!, $offset: Int!, $campaignId: Int!) {
      follows(first: $limit, skip: $offset, where: { campaignId: $campaignId, campaign_not: null }) {
        user
      }
    }
  `;
};
