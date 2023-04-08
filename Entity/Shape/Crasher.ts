/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import GameServer from "../../Game";
import LivingEntity from "../Live";
import AbstractShape from "./AbstractShape";
import * as util from "../../util";

import { Color, PositionFlags } from "../../Const/Enums";
import { AI, AIState } from "../AI";
import { tps } from "../../config";

/**
 * Crasher entity class.
 */
export default class Crasher extends AbstractShape {
    /** Controls the artificial intelligence of the crasher */
    public ai: AI;

    /** Whether or not the crasher is large. */
    public isLarge: boolean;
    /** The max speed the crasher can move when targetting a player.s */
    public targettingSpeed: number;
    public canrotate: boolean
    public invis: boolean
    public constructor(game: GameServer, large=false) {
        super(game);

        this.nameData.values.name = "Crasher";
        this.canrotate = false
        this.invis = false
       // this.positionData.values.flags |= PositionFlags.canMoveThroughWalls;
        this.healthData.values.health = this.healthData.values.maxHealth = large ? 30 : 10;
        this.physicsData.values.size = (large ? 55 : 35) * Math.SQRT1_2;
        this.physicsData.values.sides = 3;
        this.physicsData.values.absorbtionFactor = large ? 0.1 : 2;
        this.physicsData.values.pushFactor =  large ? 12 : 8;

        this.styleData.values.color = Color.EnemyCrasher;

        this.scoreReward = large ? 25 : 15;
        this.damagePerTick = 8;
        this.isLarge = large;
        this.targettingSpeed = large ? 2.64 : 2.602;

        this.ai = new AI(this);
        this.ai.viewRange = 2000;
        this.ai.aimSpeed = (this.ai.movementSpeed = this.targettingSpeed);
        this.ai['_findTargetInterval'] = tps;
    }

    tick(tick: number) {
        this.ai.aimSpeed = 0;
        this.ai.movementSpeed = this.targettingSpeed;
        if(this.invis){
            if(this.styleData.opacity >= 0.75){
                this.targettingSpeed += 3 - this.targettingSpeed * 0.05
                this.targettingSpeed = util.constrain(this.targettingSpeed, 0, 3)
            }else{
                this.targettingSpeed = 0.2
            }
            if (this.ai.state === AIState.hasTarget) { // Half
                this.styleData.opacity += 0.1
                this.damageReduction = 1
            } else {
                this.damageReduction = 0.1
                this.styleData.opacity -= 0.025
            }
            
            //this.styleData.opacity -= 0.03
            this.styleData.opacity = util.constrain(this.styleData.values.opacity, 0.05, 1);
        }
        if (this.ai.state === AIState.idle) {
            this.doIdleRotate = true;
            //this.positionData.angle += this.rotationRate - this.positionData.angle * 0.1;
        } else {
            this.doIdleRotate = false;
            if(!this.canrotate)
            {this.positionData.angle = 
            Math.atan2(this.ai.inputs.mouse.y - this.positionData.values.y, this.ai.inputs.mouse.x - this.positionData.values.x)}
            else{this.positionData.angle += 0.4 - this.rotationRate * 0.05}
            this.accel.add({
                x: this.ai.inputs.movement.x * this.targettingSpeed,
                y: this.ai.inputs.movement.y * this.targettingSpeed
            });
        }

        this.ai.inputs.movement.set({
            x: 0,
            y: 0
        })

        super.tick(tick);
    }
}
