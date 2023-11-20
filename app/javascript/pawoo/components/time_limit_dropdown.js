import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import IconButton from 'mastodon/components/icon_button';
import Overlay from 'react-overlays/Overlay';
import Motion from 'mastodon/features/ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import { supportsPassiveEvents } from 'detect-passive-events';
import classNames from 'classnames';

const messages = defineMessages({
    days: { id: 'pawoo.time_limit.days', defaultMessage: '{days, number} {days, plural, one {day} other {days}} later' },
    hours: { id: 'pawoo.time_limit.hours', defaultMessage: '{hours, number} {hours, plural, one {hour} other {hours}} later' },
    minutes: { id: 'pawoo.time_limit.minutes', defaultMessage: '{minutes, number} {minutes, plural, one {minute} other {minutes}} later' },
    select_time_limit: { id: 'pawoo.time_limit.select_time_limit', defaultMessage: 'Specify the time of automatic disappearance (Beta)' },
    time_limit_note: { id: 'pawoo.time_limit.time_limit_note', defaultMessage: 'Note: If specified, it will not be delivered to external instances.' },
});
const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

@injectIntl
class TimeLimitHeader extends React.PureComponent {

    static propTypes = {
        intl: PropTypes.object.isRequired,
    };

    render() {
        const { intl } = this.props;

        return (
            <div className='time-limit-dropdown__header'>
                <strong>{intl.formatMessage(messages.select_time_limit)}</strong>
                <div className='time-limit-dropdown__header_note'>
                    <strong>{intl.formatMessage(messages.time_limit_note)}</strong>
                </div>
            </div>
        );
    }
}


class TimeLimitDropdownMenu extends React.PureComponent {

    static propTypes = {
        style: PropTypes.object,
        items: PropTypes.array.isRequired,
        onClose: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    handleDocumentClick = e => {
        if (this.node && !this.node.contains(e.target)) {
            this.props.onClose();
        }
    };

    handleKeyDown = e => {
        const { items } = this.props;
        const value = e.currentTarget.getAttribute('data-index');
        const index = items.findIndex(item => {
            return (item.value === value);
        });
        let element = null;

        switch (e.key) {
            case 'Escape':
                this.props.onClose();
                break;
            case 'Enter':
                this.handleClick(e);
                break;
            case 'ArrowDown':
                element = this.node.childNodes[index + 1] || this.node.firstChild;
                break;
            case 'ArrowUp':
                element = this.node.childNodes[index - 1] || this.node.lastChild;
                break;
            case 'Tab':
                if (e.shiftKey) {
                    element = this.node.childNodes[index - 1] || this.node.lastChild;
                } else {
                    element = this.node.childNodes[index + 1] || this.node.firstChild;
                }
                break;
            case 'Home':
                element = this.node.firstChild;
                break;
            case 'End':
                element = this.node.lastChild;
                break;
        }

        if (element) {
            element.focus();
            this.props.onChange(element.getAttribute('data-index'));
            e.preventDefault();
            e.stopPropagation();
        }
    };

    handleClick = e => {
        const value = e.currentTarget.getAttribute('data-index');

        e.preventDefault();

        this.props.onClose();
        this.props.onChange(value);
    };

    componentDidMount() {
        document.addEventListener('click', this.handleDocumentClick, false);
        document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
        if (this.focusedItem) this.focusedItem.focus({ preventScroll: true });
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleDocumentClick, false);
        document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
    }

    setRef = c => {
        this.node = c;
    }

    setFocusRef = c => {
        this.focusedItem = c;
    };

    render() {
        const { style, items } = this.props;
        return (

            <div style={{ ...style }} role='listbox' ref={this.setRef}>
                <TimeLimitHeader />
                {items.map(item => (
                    <div role='option' tabIndex='0' key={item.value} data-index={item.value} onKeyDown={this.handleKeyDown} onClick={this.handleClick} className='time-limit-dropdown__option'>
                        <div className='time-limit-dropdown__option__content'>
                            <strong>{item.text}</strong>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default @injectIntl
class TimeLimitDropdown extends React.PureComponent {

    static propTypes = {
        isUserTouching: PropTypes.func,
        onModalOpen: PropTypes.func,
        onModalClose: PropTypes.func,
        onSelectTimeLimit: PropTypes.func.isRequired,
        intl: PropTypes.object.isRequired,
    };

    state = {
        open: false,
        placement: 'bottom',
    };

    handleToggle = () => {
        if (this.props.isUserTouching && this.props.isUserTouching()) {
            if (this.state.open) {
                this.props.onModalClose();
            } else {
                this.props.onModalOpen({
                    actions: this.options.map(option => ({ ...option, active: option.value === this.props.value })),
                    onClick: this.handleModalActionClick,
                });
            }
        } else {
            if (this.state.open && this.activeElement) {
                this.activeElement.focus({ preventScroll: true });
            }
            this.setState({ open: !this.state.open });
        }
    };

    handleModalActionClick = (e) => {
        e.preventDefault();

        const { value } = this.options[e.currentTarget.getAttribute('data-index')];

        this.props.onModalClose();
        this.props.onSelectTimeLimit(value);
    };

    handleKeyDown = e => {
        switch (e.key) {
            case 'Escape':
                this.handleClose();
                break;
        }
    };

    handleMouseDown = () => {
        if (!this.state.open) {
            this.activeElement = document.activeElement;
        }
    };

    handleButtonKeyDown = (e) => {
        switch (e.key) {
            case ' ':
            case 'Enter':
                this.handleMouseDown();
                break;
        }
    };

    handleClose = () => {
        if (this.state.open && this.activeElement) {
            this.activeElement.focus({ preventScroll: true });
        }
        this.setState({ open: false });
    };

    handleChange = value => {
        this.props.onSelectTimeLimit(value);
    };

    componentWillMount() {
        const { intl: { formatMessage } } = this.props;

        this.options = [
            { value: '#exp1m', text: formatMessage(messages.minutes, { minutes: 1 }) },
            { value: '#exp10m', text: formatMessage(messages.minutes, { minutes: 10 }) },
            { value: '#exp1h', text: formatMessage(messages.hours, { hours: 1 }) },
            { value: '#exp12h', text: formatMessage(messages.hours, { hours: 12 }) },
            { value: '#exp1d', text: formatMessage(messages.days, { days: 1 }) },
            { value: '#exp7d', text: formatMessage(messages.days, { days: 7 }) },
        ];
    }

    setTargetRef = c => {
        this.target = c;
    };

    findTarget = () => {
        return this.target;
    };

    handleOverlayEnter = (state) => {
        this.setState({ placement: state.placement });
    };

    render() {
        const { intl } = this.props;
        const { open, placement } = this.state;

        return (
            <div className={classNames('time-limit-dropdown', placement, { active: open })} onKeyDown={this.handleKeyDown}>
                <div className='time-limit-dropdown__value' ref={this.setTargetRef}>
                    <IconButton
                        className='time-limit-dropdown__value-icon'
                        icon='clock-o'
                        title={intl.formatMessage(messages.select_time_limit)}
                        size={24}
                        expanded={open}
                        active={open}
                        inverted
                        onClick={this.handleToggle}
                        onMouseDown={this.handleMouseDown}
                        onKeyDown={this.handleButtonKeyDown}
                        style={{ height: null, lineHeight: '27px' }}
                    />
                </div>

                <Overlay show={open} placement={'bottom'} flip target={this.findTarget} popperConfig={{ strategy: 'fixed', onFirstUpdate: this.handleOverlayEnter }}>
                    {({ props, placement }) => (
                        <div {...props}>
                            <div className={`dropdown-animation privacy-dropdown__dropdown ${placement}`}>
                                <TimeLimitDropdownMenu
                                    items={this.options}
                                    onClose={this.handleClose}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                    )}
                </Overlay>
            </div>
        );
    }
}
