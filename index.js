const { Plugin } = require("powercord/entities");
const { React, FluxDispatcher, getModule } = require("powercord/webpack");
const ChannelTextAreaContainer = getModule(
	(m) =>
		m.type &&
		m.type.render &&
		m.type.render.displayName === "ChannelTextAreaContainer",
	false
);
const { findInReactTree } = require("powercord/util");
const { inject, uninject } = require("powercord/injector");
const GhostMessageButton = require("./components/GhostMessageButton");
const { getCurrentUser } = getModule(["getCurrentUser"], false);
const Navigate = getModule(["transitionTo"], false);
const Messages = require("powercord/webpack").messages;
const DiscordPermissions = getModule(["Permissions"], false).Permissions;
const Permissions = getModule(["getHighestRole"], false);

module.exports = class GhostMessage extends Plugin {
	async startPlugin() {
		this.enabled = false;
		this.deleted = [];

		inject("ghost-message-transition", Navigate, "transitionTo", (args) => {
			if (this.enabled) {
				this.enabled = false;
				powercord.api.notices.sendToast(this.generateToastID(), {
					header: "Ghost Message",
					content:
						"Disabled Ghost Message automatically to prevent the embarrassment of 1,000 deaths.",
					icon: "ghost",
					timeout: 5e3,
				});
			}
			return args;
		});

		inject(
			"ghost-message-dispatcher",
			FluxDispatcher,
			"dispatch",
			(args) => {
				if (
					this.enabled &&
					args[0].type === "MESSAGE_CREATE" &&
					args[0].message.state !== "SENDING"
				) {
					const index = this.deleted.indexOf(
						args[0].message.author.id
					);
					if (index === -1) {
						const user = getCurrentUser();
						if (args[0].message.author.id == user.id) {
							this.deleted.push(args[0].message.author.id);
							Messages.deleteMessage(
								args[0].message.channel_id,
								args[0].message.id,
								false
							);
						}
					} else {
						this.deleted.splice(index, 1);
						Messages.deleteMessage(
							args[0].message.channel_id,
							args[0].message.id,
							true
						);
					}
				}
				return args;
			}
		);

		inject(
			"ghost-message-button",
			ChannelTextAreaContainer.type,
			"render",
			(args, res) => {
				// Add to the buttons.
				const props = findInReactTree(
					res,
					(r) =>
						r && r.className && r.className.indexOf("buttons-") == 0
				);
				if (
					Permissions.can(
						DiscordPermissions.SEND_MESSAGES,
						args[0].channel
					)
				) {
					props.children.unshift(
						React.createElement(GhostMessageButton, {
							plugin: this,
							enabled: this.enabled,
							toggleEnabled: this.toggleEnabled,
						})
					);
				}
				return res;
			}
		);

		ChannelTextAreaContainer.type.render.displayName =
			"ChannelTextAreaContainer";
	}

	pluginWillUnload() {
		uninject("ghost-message-transition");
		uninject("ghost-message-dispatcher");
		uninject("ghost-message-button");
	}

	toggleEnabled() {
		return (this.enabled = !this.enabled);
	}

	generateToastID() {
		return (
			"ghost-message-disabled-" +
			Math.random()
				.toString(36)
				.replace(/[^a-z]+/g, "")
				.substr(0, 5)
		);
	}
};
