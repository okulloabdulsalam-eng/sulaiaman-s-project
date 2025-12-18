/**
 * Detailed Inventory View - Enhanced inventory management
 */

class DetailedInventory {
    constructor() {
        // This extends materialRewardsSystem
    }

    renderDetailedInventory() {
        const container = document.getElementById('inventory-container');
        if (!container) return;

        const inventory = materialRewardsSystem.getInventory();
        
        let html = `
            <div class="inventory-section">
                <h3 class="panel-title">Currency</h3>
                <div class="inventory-item">
                    <span class="inventory-icon">💰</span>
                    <div class="inventory-details">
                        <div class="inventory-name">Money</div>
                        <div class="inventory-value">${materialRewardsSystem.formatCurrency(inventory.money)}</div>
                    </div>
                </div>
            </div>

            <div class="inventory-section">
                <h3 class="panel-title">Resources</h3>
                <div class="inventory-item">
                    <span class="inventory-icon">⚡</span>
                    <div class="inventory-details">
                        <div class="inventory-name">Energy</div>
                        <div class="inventory-value">${inventory.resources.energy || 0}</div>
                    </div>
                </div>
                <div class="inventory-item">
                    <span class="inventory-icon">🔧</span>
                    <div class="inventory-details">
                        <div class="inventory-name">Materials</div>
                        <div class="inventory-value">${inventory.resources.materials || 0}</div>
                    </div>
                </div>
                <div class="inventory-item">
                    <span class="inventory-icon">📚</span>
                    <div class="inventory-details">
                        <div class="inventory-name">Knowledge</div>
                        <div class="inventory-value">${inventory.resources.knowledge || 0}</div>
                    </div>
                </div>
            </div>

            <div class="inventory-section">
                <h3 class="panel-title">Influence</h3>
                <div class="inventory-item">
                    <span class="inventory-icon">⭐</span>
                    <div class="inventory-details">
                        <div class="inventory-name">Influence Points</div>
                        <div class="inventory-value">${inventory.influence || 0}</div>
                    </div>
                </div>
            </div>
        `;

        if (inventory.allies && inventory.allies.length > 0) {
            html += `
                <div class="inventory-section">
                    <h3 class="panel-title">Allies (${inventory.allies.length})</h3>
            `;
            inventory.allies.forEach(ally => {
                html += `
                    <div class="inventory-item">
                        <span class="inventory-icon">👥</span>
                        <div class="inventory-details">
                            <div class="inventory-name">${ally.name || 'Ally'}</div>
                            <div class="inventory-description">${ally.description || 'Your ally'}</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        if (inventory.assets && inventory.assets.length > 0) {
            html += `
                <div class="inventory-section">
                    <h3 class="panel-title">Assets (${inventory.assets.length})</h3>
            `;
            inventory.assets.forEach(asset => {
                html += `
                    <div class="inventory-item">
                        <span class="inventory-icon">💼</span>
                        <div class="inventory-details">
                            <div class="inventory-name">${asset.name || 'Asset'}</div>
                            <div class="inventory-description">${asset.description || 'Your asset'}</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        container.innerHTML = html;
    }
}

const detailedInventory = new DetailedInventory();

