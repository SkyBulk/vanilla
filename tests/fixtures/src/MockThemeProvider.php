<?php
/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2020 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

namespace VanillaTests\Fixtures;

use Garden\Web\Exception\NotFoundException;
use Vanilla\Models\ThemeModel;
use Vanilla\Theme\JsonAsset;
use Vanilla\Theme\ThemeProviderInterface;

/**
 * Mock theme provider for tests. Not fully implemented.
 */
class MockThemeProvider implements ThemeProviderInterface {

    /** @var array */
    private $themesByID = [];

    /**
     * @inheritdoc
     */
    public function themeKeyType(): int {
        return ThemeProviderInterface::TYPE_FS;
    }

    /**
     * @inheritdoc
     */
    public function getAllThemes(): array {
        return array_values($this->themesByID);
    }

    /**
     * @inheritdoc
     */
    public function getThemeWithAssets($themeKey, array $args = []): array {
        $result = $this->themesByID[$themeKey];
        if (!$result) {
            throw new NotFoundException("No mock theme found for key $themeKey");
        }
        return $result;
    }

    /**
     * @inheritdoc
     */
    public function getAssetData($themeKey, string $assetKey, int $revisionID = null): string {
        $theme = $this->getThemeWithAssets($themeKey);
        return $theme['assets'][$assetKey]->asArray()['data'] ?? ThemeModel::ASSET_LIST[$assetKey]['default'];
    }

    /**
     * @inheritdoc
     */
    public function deleteAsset($themeKey, string $assetKey) {
        $theme = $this->getThemeWithAssets($themeKey);
        if (isset($theme['assets'][$assetKey])) {
            unset($theme['assets'][$assetKey]);
        }
    }

    /**
     * @inheritdoc
     */
    public function postTheme(array $body): array {
        $theme = array_merge_recursive([
            'assets' => [
                'variables' => new JsonAsset('{}'),
            ],
        ], $body);

        $this->themesByID[$body['themeID']] = $theme;
        return $body;
    }

    /**
     * @inheritdoc
     */
    public function patchTheme(int $themeID, array $body): array {
        $theme = $this->getThemeWithAssets($themeID); // Check existing.
        $this->themesByID[$themeID] = array_merge_recursive($theme, $body);
        return $this->getThemeWithAssets($themeID);
    }

    /**
     * @inheritdoc
     */
    public function deleteTheme(int $themeID) {
        $this->getThemeWithAssets($themeID); // Check existing.
        unset($this->themesByID[$themeID]);
    }

    /**
     * @inheritdoc
     */
    public function getMasterThemeKey($themeKey): string {
        $theme = $this->getThemeWithAssets($themeKey);
        return $theme['parentTheme'] ?? $theme['themeID'];
    }

    /**
     * @inheritdoc
     */
    public function setCurrent($themeID): array {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function setPreviewTheme($themeID, int $revisionID = null): array {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function getCurrent(): ?array {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function getName($themeKey): string {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function setAsset(int $themeID, int $revisionID, string $assetKey, string $data): array {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function sparseAsset(int $themeID, int $revisionID, string $assetKey, string $data): array {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function themeExists($themeKey): bool {
        // Unimplemented.
    }

    /**
     * @inheritdoc
     */
    public function getThemeRevisions(int $themeKey): array {
        // Unimplemented.
    }
}
