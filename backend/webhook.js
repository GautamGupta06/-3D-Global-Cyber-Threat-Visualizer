/**
 * SOC Alerting & Webhook Dispatcher
 * Sends formatted alert payloads to Slack, Discord, or generic incident management webhooks.
 */

let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 3000; // Throttle alerts to 1 per 3 seconds max

async function dispatchWebhookAlert(threat) {
  const webhookUrl = process.env.WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const now = Date.now();
  if (now - lastAlertTime < ALERT_COOLDOWN_MS) {
    return; // Rate limit webhook dispatch
  }
  lastAlertTime = now;

  const isDiscord = webhookUrl.includes('discord.com');
  const isSlack = webhookUrl.includes('slack.com');

  let body;
  if (isDiscord) {
    body = {
      username: '3D SOC Threat Visualizer',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
      embeds: [{
        title: `🚨 [CRITICAL ALERT] ${threat.attack_type?.replace(/_/g, ' ')}`,
        description: `High severity network intrusion detected from **${threat.source_ip}** (${threat.city || 'Unknown Origin'}) targeting **${threat.dest_name || 'Central SOC Gateway'}**.`,
        color: 16717647, // Crimson red
        fields: [
          { name: 'Severity', value: `${(Number(threat.severity || 0.8) * 100).toFixed(0)}% (CRITICAL)`, inline: true },
          { name: 'Drift Score', value: `${(Number(threat.drift_score || 0) * 100).toFixed(1)}%`, inline: true },
          { name: 'Loss', value: `${Number(threat.reconstruction_error || 0).toFixed(4)}`, inline: true },
          { name: 'Source Coordinates', value: `${threat.source_lat}°, ${threat.source_long}°`, inline: false }
        ],
        footer: { text: '3D Global Cyber Threat Operations Center' },
        timestamp: new Date().toISOString()
      }]
    };
  } else if (isSlack) {
    body = {
      text: `🚨 *[CRITICAL CYBER THREAT DETECTED]*\n*Attack Type:* ${threat.attack_type}\n*Origin:* ${threat.source_ip} (${threat.city})\n*Severity Score:* ${(Number(threat.severity || 0.8) * 100).toFixed(0)}%\n*Loss:* ${Number(threat.reconstruction_error || 0).toFixed(4)}`
    };
  } else {
    // Generic Webhook
    body = {
      event: 'critical_threat_alert',
      threat,
      timestamp: new Date().toISOString()
    };
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log(`✓ Webhook alert dispatched for incident: ${threat.id || threat.source_ip}`);
  } catch (err) {
    console.error('Failed to dispatch webhook alert:', err.message);
  }
}

module.exports = {
  dispatchWebhookAlert
};
