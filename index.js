import { Plugin } from "@vizality/entities"
import { patch } from "@vizality/patcher"
import { getModule, getModuleByPrototypes } from "@vizality/webpack"
import React from "react"
import ReportPage from "./components/Report"
import { Messages } from "@vizality/I18n"
import { Icon } from "@vizality/components"

const MessageContextMenu = getModule((m) => m?.default?.displayName === "MessageContextMenu")
const { MenuItem, MenuSeparator } = getModule("MenuItem")
const { openModal } = getModule("openModal", "openModalLazy")
const { isFriend } = getModule("isFriend")
const { getCurrentUser } = getModule("getCurrentUser")
const MiniPopover = getModule(m => m?.default?.displayName === "MiniPopover")
const ToolTip = getModuleByPrototypes(["renderTooltip"])

export default class reportMessages extends Plugin {
  start () {
    this.injectStyles("./components/Style.scss")
    const { id:currentUserId } = getCurrentUser()
    patch("reportMessages-MessageContextMenu-Patch", MessageContextMenu, "default", ([{message}], {props}) => {
      function isDisabled(oldThis) {
        if (currentUserId === message.author.id) return true
        if (oldThis.settings.get("blackLists", []).filter(m => m === message.author.id).length) return true
        if (isFriend(message.author.id) && oldThis.settings.get("blackListAllFriends", true)) return true
        return false
      }
      if (!(!(this.settings.get("showDisabled", true)) && isDisabled(this)) && this.settings.get("addToPopouts", true)) {
        // Add items
        props.children.push(
          <>
            <MenuSeparator />
            <MenuItem
              label={Messages.REPORT_MESSAGE_MENU_OPTION}
              id="report"
              color={MenuItem.Colors.DANGER}
              disabled={isDisabled(this)}
              action={() => openModal(mProps => <ReportPage modalProps={mProps} message={message} />)}
            />
          </>
        )
      }
    })
    patch("reportMessages-MiniPopover-Patch", MiniPopover, "default", (res) => {
      if (!Boolean(res[0].children[res[0].children.length - 1]?.props?.message)) return 
      const ele = res[0].children[res[0].children.length - 1]
      const { message } = ele.props
      const origType = ele.type
      ele.type = () => {
        const showWhenDisPop = !(!(this.settings.get("disabledPop", true)) && isDisabled(this)) && this.settings.get("addToPop", true)
        const showWhenDisAct = !(!(this.settings.get("disabledAct", true)) && isDisabled(this)) && this.settings.get("addToAct", true)
        const popUp = origType(ele.props)
        if (!popUp?.props?.children) return popUp
        const lastPop = popUp.props.children[popUp.props.children.length - 1]
        if (lastPop !== null) {
          const oldPop = lastPop.props.renderPopout
          lastPop.props.renderPopout = (props) => {
            const test = oldPop(props)
            // Enable the report button
            if (showWhenDisAct) test.props.canReport = true
            const oldTp = test.type
            test.type = (pro) => {
              const old = oldTp(pro)
              const oldPType = old.type
              old.type = (p) => {
                const t = oldPType(p)
                // Change the action of the button
                if (showWhenDisAct) {
                  const reportItem = t.props.children.props.children.props.children.filter(m => m.key ==="report")[0]
                  reportItem.props.action = () => openModal(mProps => <ReportPage modalProps={mProps} message={message} />)
                  reportItem.props.disabled = isDisabled(this)
                }
                return t
              }
              return old
            }
            return test
          }
        }
        if (showWhenDisPop) {
          // Add button
          popUp.props.children.splice((popUp.props.children.length - 2),0,
            <ToolTip text={Messages.REPORT_MESSAGE_MENU_OPTION}>
              {TtProps => <MiniPopover.Button 
                {...TtProps} 
                className="report"
                disabled={isDisabled(this)}
                onClick={(e) => {
                  TtProps.onClick(e)
                  openModal(mProps => <ReportPage modalProps={mProps} message={message} />)
                }}
              > <Icon name="Flag" size={17} /> </MiniPopover.Button>}
            </ToolTip>
          )
        }
        return popUp
      }
      function isDisabled(oldThis) {
        if (currentUserId === message.author.id) return true
        if (oldThis.settings.get("blackLists", []).filter(m => m === message.author.id).length) return true
        if (isFriend(message.author.id) && oldThis.settings.get("blackListAllFriends", true)) return true
        return false
      }
    })
  }

  stop () {}
}
