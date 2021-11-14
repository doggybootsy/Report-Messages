import React, { memo, useState } from "react"
import { getModule, getModuleByDisplayName } from "@vizality/webpack"
import { Button, FormText, Anchor } from "@vizality/components"
import { RadioGroup } from "@vizality/components/settings"
import { Messages } from "@vizality/I18n"

const { report } = getModule("report", "submitReport")
const ConfirmModal = getModuleByDisplayName("ConfirmModal")
const { getChannel } = getModule("getDMFromUserId")
const reasons = [
  { name: "Illegal Content", desc: "Child Pornography, solicitation of minors, terrorism, threats of school shootings or criminal activity.", value: 0 },
  { name: "Harassment", desc: "Threats, stalking, bullying, sharing of personal information, impersonation or raiding.", value: 1 },
  { name: "Spam or Phishing links", desc: "Fake links, invites to servers via bot, malicious links or attachments.", value: 2 },
  { name: "Self Harm", desc: "Person is at risk at claiming intent of self-harm.", value: 3 },
  { name: "NSFW Content", desc: "Pornography or other adult content in a non-NSFW channel or unwanted DM.", value: 4 }
]

export default memo(({ modalProps, message }) => {
  const [reason, setReason] = useState(0)
  return (
    <ConfirmModal 
      header={Messages.REPORT_MESSAGE.format({ name: message.author.username })}
      confirmButtonColor={Button.Colors.RED}
      confirmText={Messages.REPORT_SPAM.split(" ")[0]}
      onConfirm={async () => {
        const reportData = {
          guild_id: getChannel(message.channel_id).guild_id,
          channel_id: message.channel_id,
          message_id: message.id,
          reason: reason
        }
        const { ok } = await report(reportData)
        vizality.api.notifications.sendToast({
          header: ok ? "Reported message successfully" : "Failed to report message",
          icon: {
            name: ok ? "InfoFilled" : "Poop",
            size: "35px"
          }
        })
      }}
      cancelText={Messages.CANCEL}
      onCancel={() => {}}
      {...modalProps}
      className="reportModalLargeModal"
    >
      <RadioGroup
        options={reasons}
        value={reason}
        onChange={({value}) => setReason(value)}
      >Reason</RadioGroup>
      <FormText>
        Reports are sent to the Discord Trust & Safety team <strong>- not the server owner. </strong>
        Creating false reports and/or spamming the report button may result in a suspension of reporting abilities.
        Learn more from the <Anchor href="https://discord.com/guidelines">Discord Community Guidelines</Anchor>.
        Thanks for keeping things safe and sound.
      </FormText>
    </ConfirmModal>
  )
})