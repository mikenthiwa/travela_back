import _ from 'lodash';

const environment = process.env.NODE_ENV;

const atChannel = environment === 'production' ? '@channel' : '';

export default ({ stackTrace, link, stackTraceId }) => ({
  text: `Travela ${environment} crash alert`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${atChannel} :travela: *New crash alert* :super-shocked:`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:rocket: *${_.capitalize(environment)}* :rocket:`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: link
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Stack Trace* - \`${stackTraceId}\``
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `\`\`\`${stackTrace}\`\`\``
      }
    }
  ]
});
