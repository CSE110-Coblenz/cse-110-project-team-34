import Konva from 'konva';

// Export the class so main.ts (or ViewManager.ts) can import it
export class MenuView {
	// This group will hold all the visual elements of the menu
	private group: Konva.Group;
	private stage: Konva.Stage;

	// The constructor receives the main stage from the App/ViewManager
	constructor(stage: Konva.Stage) {
		this.stage = stage;
		this.group = new Konva.Group();

		// Get the full screen dimensions from the stage
		const width = this.stage.width();
		const height = this.stage.height();
		const sectionWidth = width / 3;

		// --- 1. Practice Section (Left) ---
		const practiceGroup = new Konva.Group({
			x: 0,
			y: 0,
			width: sectionWidth,
			height: height,
		});

		practiceGroup.add(new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#f0f0f0', // Light gray
			stroke: 'black',
			strokeWidth: 2,
		}));

		practiceGroup.add(new Konva.Text({
			text: 'PRACTICE',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// --- 2. Classic Section (Middle) ---
		const classicGroup = new Konva.Group({
			x: sectionWidth,
			y: 0,
			width: sectionWidth,
			height: height,
		});

		classicGroup.add(new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#e0e0e0', // Medium gray
			stroke: 'black',
			strokeWidth: 2,
		}));

		classicGroup.add(new Konva.Text({
			text: 'CLASSIC',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// --- 3. Cracked Section (Right) ---
		const crackedGroup = new Konva.Group({
			x: sectionWidth * 2,
			y: 0,
			width: sectionWidth,
			height: height,
		});

		crackedGroup.add(new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#d0d0d0', // Darker gray
			stroke: 'black',
			strokeWidth: 2,
		}));

		crackedGroup.add(new Konva.Text({
			text: 'CRACKED',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// Add all three sections to the main menu group
		this.group.add(practiceGroup, classicGroup, crackedGroup);

		// Start hidden by default, the App/ViewManager will show it
		this.hide();

		// TODO: Add event listeners here or in the MenuController
		// Your MenuController will be responsible for what happens
		// when these groups are clicked.
		// Example:
		// practiceGroup.on('click', () => {
		//   console.log('Practice Mode Clicked');
		// });
	}

	// Method for the App/ViewManager to get this screen's elements
	getGroup() {
		return this.group;
	}

	// Method for the App/ViewManager to show this screen
	show() {
		this.group.show();
	}

	// Method for the App/ViewManager to hide this screen
	hide() {
		this.group.hide();
	}
}