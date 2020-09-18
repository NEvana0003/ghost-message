const {
	React,
	getModuleByDisplayName,
	getModule,
} = require("powercord/webpack");
const Tooltip = getModuleByDisplayName("Tooltip", false);
const Button = require("powercord/components").Button;

const buttonClasses = getModule(["button"], false);
const buttonWrapperClasses = getModule(["buttonWrapper", "pulseButton"], false);
const buttonTextAreaClasses = getModule(["button", "textArea"], false);

class GhostMessageButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			enabled: this.props.enabled,
		};
	}

	render() {
		return (
			<Tooltip color="black" postion="top" text="Toggle Ghost Message">
				{({ onMouseLeave, onMouseEnter }) => (
					<Button
						className={`ghost-message-button${
							this.state.enabled
								? ` ${buttonWrapperClasses.active}`
								: ""
						}`}
						look={Button.Looks.BLANK}
						size={Button.Sizes.ICON}
						onClick={() => {
							this.setState({
								enabled: this.props.toggleEnabled.call(
									this.props.plugin
								),
							});
						}}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						<div
							className={`${buttonClasses.contents} ${buttonWrapperClasses.button} ${buttonTextAreaClasses.button}`}
						>
							<svg
								className={`${buttonWrapperClasses.icon}`}
								width="18"
								height="18"
								viewBox="0 0 450.002 450.002"
								style={{
									transform: `scale(${
										this.state.enabled ? 1.14 : 1
									})`,
								}}
							>
								<path
									fill="currentColor"
									d="M411.972,204.367c0-118.248-83.808-204.777-186.943-204.365C121.896-0.41,38.001,86.119,38.001,204.367L38.373,441  l62.386-29.716l62.382,38.717l62.212-38.716l62.215,38.718l62.213-38.714l62.221,29.722L411.972,204.367z M143.727,258.801  c-27.585-6.457-44.713-34.053-38.256-61.638l99.894,23.383C198.908,248.13,171.312,265.258,143.727,258.801z M306.276,258.801  c-27.585,6.457-55.181-10.671-61.638-38.256l99.894-23.383C350.988,224.748,333.861,252.344,306.276,258.801z"
								></path>
							</svg>
						</div>
					</Button>
				)}
			</Tooltip>
		);
	}
}

module.exports = GhostMessageButton;
