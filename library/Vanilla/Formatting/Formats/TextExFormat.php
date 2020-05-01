<?php
/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

namespace Vanilla\Formatting\Formats;

use Vanilla\Formatting\FormatConfig;
use Vanilla\Formatting\Html\HtmlEnhancer;
use Vanilla\Formatting\Html\Processor\UserContentCssProcessor;

/**
 * Class for rendering content of the markdown format.
 */
class TextExFormat extends TextFormat {

    const FORMAT_KEY = "textex";

    /** @var HtmlEnhancer */
    private $htmlEnhancer;

    /**
     * DI.
     *
     * @param FormatConfig $formatConfig
     * @param HtmlEnhancer $htmlEnhancer
     * @param UserContentCssProcessor $userContentCssProcessor
     */
    public function __construct(
        FormatConfig $formatConfig,
        HtmlEnhancer $htmlEnhancer,
        UserContentCssProcessor $userContentCssProcessor
    ) {
        parent::__construct($formatConfig);
        $this->htmlEnhancer = $htmlEnhancer;
        $this->addHtmlProcessor($userContentCssProcessor);
    }

    /**
     * @inheritdoc
     */
    public function renderHTML(string $content): string {
        $result = parent::renderHTML($content);
        $result = $this->htmlEnhancer->enhance($result);
        $result = $this->applyHtmlProcessors($result);
        return $result;
    }

    /**
     * @inheritdoc
     */
    public function renderQuote(string $content): string {
        $result = parent::renderHTML($content);
        $result = $this->htmlEnhancer->enhance($result, true, false);
        return $result;
    }
}
