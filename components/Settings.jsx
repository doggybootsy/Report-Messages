import React, { memo, useState } from "react"
import { TextArea, SwitchItem, Category } from "@vizality/components/settings"

export default memo(({ getSetting, updateSetting, toggleSetting }) => {
  const [blackList, setBlackList] = useState(getSetting("whiteListAllFriends", true))
  const [disabled, setDisabled] = useState(getSetting("showDisabled", true))
  const [addToPopouts, setAddToPopouts] = useState(getSetting("addToPopouts", true))
  const [disabledPop, setDisabledPop] = useState(getSetting("disabledPop", true))
  const [addToPop, setAddToPop] = useState(getSetting("addToPop", true))
  return (
    <>
      <TextArea
        note="Place User Ids In Seperate Lines and this makes it so you cant report that users messages"
        value={getSetting("blackLists", []).join("\n")}
        onChange={(e) => updateSetting("blackLists", e.split("\n"))}
      >Black Listed Users</TextArea>
      <SwitchItem
        description="If enabled you cant report your friends messages"
        value={blackList}
        onChange={() => {
          toggleSetting("blackListAllFriends", true)
          setBlackList(!blackList)
        }}
      >Black List All Friends</SwitchItem>
      <Category title="Popout">
        <SwitchItem
          value={addToPopouts}
          onChange={() => {
            toggleSetting("addToPopouts", true)
            setAddToPopouts(!addToPopouts)
          }}
        >Add to Popouts</SwitchItem>
        <SwitchItem
          value={disabled}
          onChange={() => {
            toggleSetting("showDisabled", true)
            setDisabled(!disabled)
          }}
        >Show The Disabled Context Item</SwitchItem>
      </Category>
      <Category title="Mini Popover">
        <SwitchItem
          value={addToPop}
          onChange={() => {
            toggleSetting("addToPop", true)
            setAddToPop(!addToPop)
          }}
        >Add to Mini Popover</SwitchItem>
        <SwitchItem
          value={disabledPop}
          onChange={() => {
            toggleSetting("disabledPop", true)
            setDisabledPop(!disabledPop)
          }}
        >Show The Disabled Mini Popover Button</SwitchItem>
      </Category>
    </>
  )
})
